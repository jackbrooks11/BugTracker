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
        Task<bool> UserExists(string username);
        Task<IEnumerable<IdentityError>> CreateUser(AppUser user, string password);
    }
}