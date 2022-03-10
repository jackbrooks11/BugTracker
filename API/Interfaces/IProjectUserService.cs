using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces
{
    public interface IProjectUserService
    {
        Task<PagedList<PaginatedProjectUserDto>> GetUsersForProjectPaginated(UserParams userParams, string projectTitle);
        IEnumerable<string> GetUsersNotInProject(string projectTitle);
        IEnumerable<Project> GetProjectsForUser(string username);
        IEnumerable<string> GetUsersForProject(string projectTitle);
        void DeleteProjectUsers(Project project, DeleteUsersFromProjectDto usernamesToDelete);
        void AddProjectUser(Project project, AppUser user);
    }
}