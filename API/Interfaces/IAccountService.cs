using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Identity;

namespace API.Interfaces
{
    public interface IAccountService
    {
        Task<IdentityResult> ChangePassword(AppUser user, EditUserDto editUserDto);
        Task<string> UserExists(RegisterDto registerDto);
        Task<IEnumerable<IdentityError>> CreateUser(RegisterDto registerDto);
    }
}