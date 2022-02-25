using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    public class AccountController : BaseApiController
    {
        private readonly SignInManager<AppUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly IUserService _userService;
        private readonly IAccountService _accountService;
        private readonly IMapper _mapper;
        public AccountController(IMapper mapper, SignInManager<AppUser> signInManager, ITokenService tokenService,
            IUserService userService, IAccountService accountService)
        {
            _mapper = mapper;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _userService = userService;
            _accountService = accountService;
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
                Company = user.Company,
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
                Company = user.Company,
                Token = await _tokenService.CreateToken(user)
            };
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