using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly DataContext _context;
        public ProjectRepository(DataContext context)
        {
            _context = context;
        }

        public void Create(Project project)
        {
            _context.Projects.Add(project);
        }

        public async Task<PagedList<Project>> GetProjectsAsync(ProjectParams projectParams)
        {
            var query = _context.Projects
                .AsNoTracking();
            if (projectParams.SearchMatch != null)
            {
                query = query.Where(p => (p.Title.ToLower().Contains(projectParams.SearchMatch.ToLower()) ||
                p.Description.ToLower().Contains(projectParams.SearchMatch.ToLower())));
            }
            if (!projectParams.Ascending)
            {
                query = projectParams.OrderBy switch
                {
                    "title" => query.OrderByDescending(p => p.Title),
                    "description" => query.OrderByDescending(p => p.Description),
                    _ => query.OrderByDescending(t => t.Created)
                };
            }
            else
            {
                query = projectParams.OrderBy switch
                {
                    "title" => query.OrderBy(p => p.Title),
                    "description" => query.OrderBy(p => p.Description),
                    _ => query.OrderBy(t => t.Created)

                };
            }
            return await PagedList<Project>.CreateAsync(query, projectParams.PageNumber, projectParams.PageSize);

        }

        public void Delete(int[] projectIdsToDelete)
        {
            var projectsToDelete = _context.Projects.Where(t => projectIdsToDelete.Contains(t.Id));

            foreach (var project in projectsToDelete)
            {
                _context.Remove(project);
            }
        }

        public async Task<bool> ProjectExists(string title)
        {
            return await _context.Projects.AnyAsync(x => x.Title.ToLower() == title.ToLower());
        }

        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}