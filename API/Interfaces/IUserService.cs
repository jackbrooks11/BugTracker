using System.Collections.Generic;
using System.Threading.Tasks;
using API.Entities;

namespace API.Interfaces
{
    public interface IUserService
    {
        Task<AppUser> GetUserByIdAsync(int id);
        Task<AppUser> GetUserByUsernameAsync(string username);
        Task<List<string>> GetRoles(string username);
        void MarkUserAsModified(AppUser user);
        Task<bool> SaveAllAsync();

    }
}