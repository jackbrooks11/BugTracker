using System.Collections.Generic;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace API.Services
{
    public class AccountService : IAccountService
    {
        private readonly DataContext _context;
        private readonly UserManager<AppUser> _userManager;
        public AccountService(IConfiguration config, DataContext context,  UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }
        [Authorize]
        public async Task<IdentityResult> ChangePassword(AppUser user, EditUserDto editUserDto)
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, editUserDto.Password);
            return result;
        }

        public async Task<IEnumerable<IdentityError>> CreateUser(AppUser user, string password)
        {
            var result = await _userManager.CreateAsync(user, password);

            if (!result.Succeeded) return result.Errors;

            var roleResult = await _userManager.AddToRoleAsync(user, "Developer");

            if (!roleResult.Succeeded) return result.Errors;

            return null;
        }

        public async Task<bool> UserExists(string username)
        {
            return await _userManager.Users.AnyAsync(x => x.UserName == username.ToLower());
        }
    }
}    