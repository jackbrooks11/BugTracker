using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces
{
    public interface IAdminService
    {
        Task<PagedList<PaginatedUserDto>> GetUsersWithRoles(UserParams userParams);
        Task<string> ChangeRoles(AppUser user, string[] selectedRoles);
        Task<IEnumerable<AppUser>> GetAdmins();
        Task<IList<string>> GetRoles(AppUser user);
        void DeleteUsers(int[] userIdsToDelete);
        AppUser MapUser(RegisterDto registerDto, AppUser user);
        Task<bool> SaveAllAsync();
    }
}