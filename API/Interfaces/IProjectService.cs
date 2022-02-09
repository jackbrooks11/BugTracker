using System.Collections.Generic;
using System.Threading.Tasks;
using API.Entities;
using API.Helpers;

namespace API.Interfaces
{
    public interface IProjectService
    {
        public Task<Project> GetProject(string name);
        public Task<Project> GetProjectById(int id);
        IEnumerable<Project> GetProjects();
        Task<PagedList<Project>> GetProjectsPaginated(ProjectParams projectParams);
        Task<PagedList<Project>> GetProjectsForUser(ProjectParams projectParams, int userId);
        void DeleteProjects(int[] projectIdsToDelete);
        void AddProject(Project project);
        Task<string> ValidateProject(Project project, Project projectUpdated);
        void MarkProjectAsModified(Project project);
        Task<bool> SaveAllAsync();
    }
}