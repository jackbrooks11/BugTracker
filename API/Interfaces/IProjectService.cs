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
        void CreateProject(Project project);
        Task<string> ValidateProject(Project newProject);

        void MarkProjectAsModified(Project project);
        Project MapProject(Project projectUpdated, Project project);

        Task<bool> SaveAllAsync();
    }
}