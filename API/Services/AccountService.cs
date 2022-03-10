using System.Collections.Generic;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace API.Services
{
    public class AccountService : IAccountService
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> _userManager;
        public AccountService(IConfiguration config, DataContext context, IMapper mapper, UserManager<AppUser> userManager)
        {
            _context = context;
            _mapper = mapper;
            _userManager = userManager;
        }
        [Authorize]
        public async Task<IdentityResult> ChangePassword(AppUser user, EditUserDto editUserDto)
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, editUserDto.NewPassword);
            return result;
        }

        public async Task<IEnumerable<IdentityError>> CreateUser(RegisterDto registerDto)
        {
            var user = _mapper.Map<AppUser>(registerDto);
            user.UserName = registerDto.Username.ToLower();
            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded) return result.Errors;

            var roleResult = await _userManager.AddToRoleAsync(user, "Developer");

            if (!roleResult.Succeeded) return result.Errors;

            return null;
        }

        public async Task<string> UserExists(RegisterDto registerDto)
        {
            if (await _userManager.Users.AnyAsync(x => x.UserName == registerDto.Username.ToLower()))
            {
                return "Username already in use.";
            }
            if (await _userManager.FindByEmailAsync(registerDto.Email) != null)
            {
                return "Email address already in use.";
            }
            return "";
        }
    } 
}   