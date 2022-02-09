using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace API.Services
{
    public class ProjectUserService : IProjectUserService
    {
        private readonly DataContext _context;
        private readonly UserManager<AppUser> _userManager;
        public ProjectUserService(IConfiguration config, DataContext context, UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }
        public async Task<PagedList<PaginatedUserDto>> GetUsersForProjectPaginated(UserParams userParams, string projectTitle)
        {
            var query = _userManager.Users
                .Where(pu => pu.ProjectUsers.Any(u => u.Project.Title == projectTitle))
                .Include(r => r.UserRoles)
                .ThenInclude(r => r.Role)
                .AsNoTracking();
            if (userParams.SearchMatch != null)
            {
                query = query.Where(u => u.UserRoles.Any(r => r.Role.Name.ToLower().Contains(userParams.SearchMatch))
                || u.UserName.ToLower().Contains(userParams.SearchMatch));
            }
            var userLength = query.Count();
            if (!userParams.Ascending)
            {
                query = query.OrderByDescending(u => u.UserName);
            }
            else
            {
                query = query.OrderBy(u => u.UserName);
            }
            query = query
                .Skip((userParams.PageNumber - 1) * userParams.PageSize)
                .Take(userParams.PageSize);
            var userList = await query
            .Select(u => new
            {
                u.Id,
                Username = u.UserName,
                Roles = u.UserRoles.Select(r => r.Role.Name).ToList()
            }).ToListAsync();
            var usersReformatted = new List<PaginatedUserDto>();
            foreach (var user in userList)
            {
                usersReformatted.Add(new PaginatedUserDto(user.Id, user.Username, user.Roles));
            }
            return new PagedList<PaginatedUserDto>(usersReformatted, userLength, userParams.PageNumber, userParams.PageSize);
        }
        public IEnumerable<string> GetUsersNotInProject(string projectTitle)
        {
            var usersInProject = _context.ProjectUsers.Where(pu => pu.Project.Title == projectTitle).Select(u => u.User.Id).ToList();
            return _context.Users.Where(u => !usersInProject.Contains(u.Id))
            .OrderBy(u => u.UserName)
            .Select(u => u.UserName);
        }
        public IEnumerable<Project> GetProjectsForUser(string username) {
            return _context.ProjectUsers.Where(pu => pu.User.UserName == username).Select(p => p.Project);
        }
        public IEnumerable<string> GetUsersForProject(string projectTitle) {
            return _context.ProjectUsers.Where(pu => pu.Project.Title == projectTitle).Select(u => u.User.UserName);
        }
        public void DeleteProjectUsers(Project project, DeleteUsersFromProjectDto usernamesToDelete) 
        {
            var projectUsersToDelete = GetProjectUsersToDelete(project, usernamesToDelete);
            foreach (var projectUser in projectUsersToDelete)
            {
                _context.Remove(projectUser);
            }
        }
        public void AddProjectUser(Project project, AppUser user)
        {
            var projectUser = new ProjectUser();
            projectUser.ProjectId = project.Id;
            projectUser.UserId = user.Id;
            _context.ProjectUsers.Add(projectUser);
        }
        private IEnumerable<ProjectUser> GetProjectUsersToDelete(Project project, DeleteUsersFromProjectDto usernamesToDelete)
        {
            return _context.ProjectUsers.Where(pu => pu.ProjectId == project.Id && usernamesToDelete.UsernamesToDelete.Contains(pu.User.UserName));
        }
    }
}