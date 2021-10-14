using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces
{
    public interface IProjectRepository
    {
        void Update(Project project);
        Task<bool> SaveAllAsync();
        Task<PagedList<Project>> GetProjectsAsync(ProjectParams projectParams);
        void AddTicketToProjectAsync(Ticket ticket);
        void AddUserToProjectAsync(int projectId, AppUser user);

        void Create(Project project);
        Task<bool> ProjectExists(string title);
        void Delete(int[] projectIdsToDelete);
        Task<PagedList<Project>> GetProjectsForUserAsync(int id, ProjectParams projectParams);
        Task<Project> GetProjectByIdAsync(int id);
        Task<Project> GetProjectByTitleAsync(string title);
        void DeleteUsers(DeleteUsersFromProjectDto usernamesToDelete);
    }
}