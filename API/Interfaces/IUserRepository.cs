using System.Collections.Generic;
using System.Threading.Tasks;
using API.Entities;
using API.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace API.Interfaces
{
    public interface IUserRepository
    {
        Task<bool> SaveAllAsync();
        Task<AppUser> GetUserByIdAsync(int id);
    }
}