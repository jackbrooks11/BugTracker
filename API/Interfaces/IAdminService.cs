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

        Task<IList<string>> GetRoles(AppUser user);
    }
}