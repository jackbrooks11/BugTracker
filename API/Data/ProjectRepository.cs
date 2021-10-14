using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
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
        public async Task<Project> GetProjectByIdAsync(int id)
        {
            return await _context.Projects
            .Include(t => t.Tickets)
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == id);
        } 
        public async Task<Project> GetProjectByTitleAsync(string title)
        {
            return await _context.Projects
            .Include(t => t.Tickets)
            .SingleOrDefaultAsync(x => x.Title == title);
        }

        public async Task<PagedList<Project>> GetProjectsAsync(ProjectParams projectParams)
        {
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
            return await PagedList<Project>.CreateAsync(query, projectParams.PageNumber, projectParams.PageSize);

        }
        public async Task<PagedList<Project>> GetProjectsForUserAsync(int id, ProjectParams projectParams)
        {
            var query = _context.Projects.Where(pu => pu.ProjectUsers.Any(p => p.UserId == id))
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
            var projectsToDelete = _context.Projects.Where(p=> projectIdsToDelete.Contains(p.Id))
            .Include(t => t.Tickets);

            foreach (var project in projectsToDelete)
            {
                if (project.Tickets.Count > 0) {
                    foreach (var ticket in project.Tickets) {
                        _context.Remove(ticket);
                    }
                }
                _context.Remove(project);
            }
        }
        public void DeleteUsers(DeleteUsersFromProjectDto usernamesToDelete)
        {
            var project = usernamesToDelete.Project;

            var projectUsersToDelete = _context.ProjectUser.Where(pu => pu.ProjectId == project.Id && usernamesToDelete.UsernamesToDelete.Contains(pu.User.UserName));

            foreach (var projectUser in projectUsersToDelete) {
                _context.Remove(projectUser);
            }
        }
        public async void AddTicketToProjectAsync(Ticket ticket)
        {
            var project = await this.GetProjectByTitleAsync(ticket.Project);
            project.Tickets.Add(ticket);
        }

        public async void AddUserToProjectAsync(int projectId, AppUser user)
        {
            var project = await this.GetProjectByIdAsync(projectId);
            var projectUser = new ProjectUser();
            projectUser.ProjectId = project.Id;
            projectUser.UserId = user.Id;
            _context.ProjectUser.Add(projectUser);
        }
        public async Task<bool> ProjectExists(string title)
        {
            return await _context.Projects.AnyAsync(x => x.Title.ToLower() == title.ToLower());
        }
        public void Update(Project project)
        {
            _context.Entry(project).State = EntityState.Modified;
        }

        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}