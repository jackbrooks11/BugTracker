using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;

namespace API.Controllers
{
    [Route("api/[controller]")]
    public class AccountController : BaseApiController
    {
        private readonly SignInManager<AppUser> _signInManager;
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly IUserService _userService;
        private readonly IAccountService _accountService;
        private readonly IEmailService _emailService;
        private readonly IMapper _mapper;
        public AccountController(IMapper mapper, SignInManager<AppUser> signInManager, UserManager<AppUser> userManager, 
        ITokenService tokenService, IUserService userService, IAccountService accountService, IEmailService emailService)
        {
            _mapper = mapper;
            _signInManager = signInManager;
            _userManager = userManager;
            _tokenService = tokenService;
            _userService = userService;
            _accountService = accountService;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await _accountService.UserExists(registerDto.Username)) return BadRequest("Username is taken");

            var user = _mapper.Map<AppUser>(registerDto);
            user.UserName = registerDto.Username.ToLower();
            var result = await _accountService.CreateUser(user, registerDto.Password);
            if (result != null) {
                return BadRequest(result);
            }
            return new UserDto
            {
                Username = user.UserName,
                Email = user.Email,
                Token = await _tokenService.CreateToken(user)
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userService.GetUserByUsernameAsync(loginDto.Username);
            if (user == null) return Unauthorized("Invalid username");

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (!result.Succeeded) return Unauthorized();

            return new UserDto
            {
                Username = user.UserName,
                Email = user.Email,
                Token = await _tokenService.CreateToken(user)
            };
        }
        
        [HttpPost("forgotPassword")]
        public async Task<ActionResult<ForgotPasswordDto>> ForgotPassword([Required]ForgotPasswordDto forgotPasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest("Invalid request.");
            var email = forgotPasswordDto.Email;
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return Ok();
 
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var param = new Dictionary<string, string>
            {
                {"token", token },
                {"email", forgotPasswordDto.Email }
            };
            var callback = QueryHelpers.AddQueryString(forgotPasswordDto.ClientURI, param);
            _emailService.SendEmail(email, callback);
            return Ok();
        }
        
        [HttpPost("ResetPassword")]
        public async Task<IActionResult> ResetPassword([FromBody]ResetPasswordDto resetPasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest();
            var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);
            if (user == null)
                return BadRequest("Invalid Request");
            var resetPassResult = await _userManager.ResetPasswordAsync(user, resetPasswordDto.Token, resetPasswordDto.Password);
            if (!resetPassResult.Succeeded)
            {
                var errors = resetPassResult.Errors.Select(e => e.Description);
                return BadRequest(new { Errors = errors });
            }
            return Ok();
        }
                
        [HttpPut]
        public async Task<ActionResult<AppUser>> UpdateUser(EditUserDto partialUser)
        {
            var user = await _userService.GetUserByUsernameAsync(User.GetUsername());
            _mapper.Map(partialUser, user);
            /*Update user password*/
            if (partialUser.Password != "")
            {
                var result = await _accountService.ChangePassword(user, partialUser);
                if (!result.Succeeded)
                {
                    return BadRequest("Inadequate Password");
                }
            }
            _userService.MarkUserAsModified(user);
            if (await _userService.SaveAllAsync()) return user;
            return BadRequest("Failed to update user");
        }
    }
}