using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace API.Services
{
    public class ProjectService : IProjectService
    {
        private readonly DataContext _context;
        public ProjectService(IConfiguration config, DataContext context)
        {
            _context = context;
        }
        public async Task<Project> GetProject(string name)
        {
         return await _context.Projects
            .Include(t => t.Tickets)
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Title == name);
        }
        public async Task<Project> GetProjectById(int id)
        {
         return await _context.Projects
            .Include(t => t.Tickets)
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == id);
        }
        public IEnumerable<Project> GetProjects()
        {
            return _context.Projects.AsNoTracking();
        }
        public async Task<PagedList<Project>> GetProjectsPaginated(ProjectParams projectParams)
        {
            var query = GetProjectQuery(projectParams);
            return await PagedList<Project>.CreateAsync(query, projectParams.PageNumber, projectParams.PageSize);
        }
        public async Task<PagedList<Project>> GetProjectsForUser(ProjectParams projectParams, int userId)
        {
            var query = GetProjectQuery(projectParams);
            query = query.Where(pu => pu.ProjectUsers.Any(p => p.UserId == userId));
            return await PagedList<Project>.CreateAsync(query, projectParams.PageNumber, projectParams.PageSize);
        }
        public void DeleteProjects(int[] projectIdsToDelete) {
            var projectsToDelete = GetProjectsToDelete(projectIdsToDelete);
            foreach (var project in projectsToDelete)
            {
                if (project.Tickets.Count > 0)
                {
                    foreach (var ticket in project.Tickets)
                    {
                        _context.Remove(ticket);
                    }
                }
                _context.Remove(project);
            }
        }
        public void AddProject(Project project) {
            _context.Projects.Add(project);
        }
        public async Task<string> ValidateProject(Project project, Project projectUpdated) {
            if (await _context.Projects.AnyAsync(x => x.Title.ToLower() == projectUpdated.Title.ToLower())) {
                if (project != null) {
                    if (projectUpdated.Title != project.Title) {
                        return "Project title already taken.";
                    }
                    return "";
                }
                else {
                   return "Project title already taken."; 
                } 
            }
            return "";
        }
        public void MarkProjectAsModified(Project project) {
            foreach (Ticket ticket in project.Tickets) {
                ticket.Project = project.Title;
                _context.Entry(ticket).State = EntityState.Modified;
            }
            _context.Entry(project).State = EntityState.Modified;   
        }
        private IEnumerable<Project> GetProjectsToDelete(int[] projectIdsToDelete)
        {
            return _context.Projects.Where(p => projectIdsToDelete.Contains(p.Id))
                .Include(t => t.Tickets);
        }
        private IQueryable<Project> GetProjectQuery(ProjectParams projectParams) {
            var query = _context.Projects
                .Include(t => t.Tickets)
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
            return query;
        }
        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}