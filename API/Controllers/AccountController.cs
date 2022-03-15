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
        public async Task<ActionResult> Register(RegisterDto registerDto)
        {
            var userExists = await _accountService.UserExists(registerDto);
            if (userExists != "") return BadRequest(userExists);
            var result = await _accountService.CreateUser(registerDto);
            if (result != null) return BadRequest(result);
            var user = await _userService.GetUserByUsernameAsync(registerDto.Username);
            var mail = await _emailService.CreateEmail(registerDto.ClientURI, registerDto.Email, user);
            var emailSent = _emailService.SendEmail(mail);
            if (!emailSent) return BadRequest("Email can not be sent.");
            return Ok();
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            if (!ModelState.IsValid) return BadRequest("Invalid request.");
            loginDto.Username = loginDto.Username.ToLower();
            var user = await _userService.GetUserByUsernameAsync(loginDto.Username);
            if (user == null) return Unauthorized("Invalid username");
            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
            if (!result.Succeeded) return Unauthorized("Invalid login attempt");
            return new UserDto
            {
                Username = user.UserName,
                Email = user.Email,
                Token = await _tokenService.CreateToken(user)
            };
        }
        
        [HttpGet("loginAsDemo")]
        public async Task<ActionResult<UserDto>> LoginAsDemo()
        {
            var user = await _userService.GetUserByUsernameAsync("admin");
            if (user == null) return Unauthorized("Invalid username");
            return new UserDto
            {
                Username = user.UserName,
                Email = user.Email,
                Token = await _tokenService.CreateToken(user)
            };
        }

        [HttpPost("forgotPassword")]
        public async Task<ActionResult<ForgotPasswordDto>> ForgotPassword([Required] ForgotPasswordDto forgotPasswordDto)
        {
            if (!ModelState.IsValid) return BadRequest("Invalid request.");
            var email = forgotPasswordDto.Email;
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return Ok();
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var param = new Dictionary<string, string>
            {
                {"token", token },
                {"email", forgotPasswordDto.Email }
            };
            var callback = QueryHelpers.AddQueryString(forgotPasswordDto.ClientURI, param);
            var mail = new Mail
            {
                To = forgotPasswordDto.Email,
                Link = callback,
                Subject = "Password Reset"
            };
            var emailSent = _emailService.SendEmail(mail);
            if (!emailSent) return BadRequest("Email can not be sent.");
            return Ok();
        }

        [HttpPost("ResetPassword")]
        public async Task<ActionResult<UserDto>> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            if (!ModelState.IsValid) return BadRequest("Essential information missing.");
            var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);
            if (user == null) return BadRequest("Invalid Request");
            var resetPassResult = await _userManager.ResetPasswordAsync(user, resetPasswordDto.Token, resetPasswordDto.Password);
            if (!resetPassResult.Succeeded) return BadRequest("Invalid Request");
            return new UserDto
            {
                Username = user.UserName,
                Email = user.Email,
                Token = await _tokenService.CreateToken(user)
            };
        }

        [HttpPut]
        public async Task<ActionResult<AppUser>> UpdateUser(EditUserDto editUserDto)
        {
            var user = await _userService.GetUserByUsernameAsync(User.GetUsername());
            /*Update user password*/
            if (editUserDto.NewPassword != "")
            {
                var checkPassword = await _signInManager.CheckPasswordSignInAsync(user, editUserDto.Password, false);
                if (!checkPassword.Succeeded) return Unauthorized("Invalid password.");
                var result = await _accountService.ChangePassword(user, editUserDto);
                if (!result.Succeeded) return BadRequest("Inadequate Password");
            }
            _mapper.Map(editUserDto, user);
            _userService.MarkUserAsModified(user);
            if (await _userService.SaveAllAsync()) return user;
            return BadRequest("Failed to update user");
        }

        [HttpPost("confirmEmail")]
        public async Task<ActionResult<UserDto>> ConfirmEmail(ConfirmEmailDto confirmEmailDto)
        {
            if (!ModelState.IsValid) return BadRequest("Essential information missing.");
            var user = await _userManager.FindByEmailAsync(confirmEmailDto.Email);
            if (user == null) return BadRequest("Email not associated with an account.");
            var result = await _userManager.ConfirmEmailAsync(user, confirmEmailDto.Token);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);
                return BadRequest(errors);
            }
            return new UserDto
            {
                Username = user.UserName,
                Email = user.Email,
                Token = await _tokenService.CreateToken(user)
            };
        }
    }
}