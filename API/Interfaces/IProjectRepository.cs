using System.Threading.Tasks;
using API.Entities;
using API.Helpers;

namespace API.Interfaces
{
    public interface IProjectRepository
    {
        Task<bool> SaveAllAsync();
        Task<PagedList<Project>> GetProjectsAsync(ProjectParams projectParams);
        void Create(Project project);
        Task<bool> ProjectExists(string title);
        void Delete(int[] projectIdsToDelete);

    }
}