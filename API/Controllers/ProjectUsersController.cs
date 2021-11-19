using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    public class ProjectUsersController : BaseApiController
    {
        private readonly DataContext _context;
        private readonly UserManager<AppUser> __userManager;
        public ProjectUsersController(DataContext context, UserManager<AppUser> _userManager)
        {
            _context = context;
            __userManager = _userManager;
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("{projectId}/deleteUsers")]
        public async Task<ActionResult> DeleteProjectUsers(DeleteUsersFromProjectDto usernamesToDelete)
        {
            var project = usernamesToDelete.Project;

            var projectUsersToDelete = _context.ProjectUsers.Where(pu => pu.ProjectId == project.Id && usernamesToDelete.UsernamesToDelete.Contains(pu.User.UserName));

            foreach (var projectUser in projectUsersToDelete)
            {
                _context.Remove(projectUser);
            }
            if (await _context.SaveChangesAsync() > 0) return NoContent();

            return BadRequest("Failed to delete user from project");
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("{projectId}/addUser")]
        public async Task<ActionResult> AddProjectUser(ProjectUserDto projectUserDto)
        {
            var project = await _context.Projects
                .Include(t => t.Tickets)
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Id == projectUserDto.ProjectId);
            var user = await _context.Users
                .AsNoTracking()
                .SingleOrDefaultAsync(u => u.UserName.ToLower() == projectUserDto.Username);
            var projectUser = new ProjectUser();
            projectUser.ProjectId = project.Id;
            projectUser.UserId = user.Id;
            _context.ProjectUsers.Add(projectUser);
            if (await _context.SaveChangesAsync() > 0) return NoContent();

            return BadRequest("Failed to add user to project");
        }

        [HttpGet("{projectTitle}/usersPaginated")]
        public async Task<ActionResult<IEnumerable<AppUser>>> GetUsersForProjectPaginated(string projectTitle, [FromQuery] UserParams userParams)
        {
            var users = __userManager.Users
                .Where(pu => pu.ProjectUsers.Any(u => u.Project.Title == projectTitle))
                .Include(r => r.UserRoles)
                .ThenInclude(r => r.Role)
                .AsNoTracking();
            if (userParams.SearchMatch != null)
            {
                users = users.Where(u => u.UserRoles.Any(r => r.Role.Name.ToLower().Contains(userParams.SearchMatch))
                || u.UserName.ToLower().Contains(userParams.SearchMatch));
            }
            var userLength = users.Count();
            if (!userParams.Ascending)
            {
                users = users.OrderByDescending(u => u.UserName);
            }
            else
            {
                users = users.OrderBy(u => u.UserName);
            }
            users = users
                .Skip((userParams.PageNumber - 1) * userParams.PageSize)
                .Take(userParams.PageSize);
            var userList = await users
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

            var usersPaginated = new PagedList<PaginatedUserDto>(usersReformatted, userLength, userParams.PageNumber, userParams.PageSize);
            Response.AddPaginationHeader(usersPaginated.CurrentPage, usersPaginated.PageSize, usersPaginated.TotalCount, usersPaginated.TotalPages);
            return Ok(usersPaginated);
        }

        [HttpGet("{projectTitle}/usersNotInProject")]
        public ActionResult<IEnumerable<string>> GetUsersNotInProject(string projectTitle)
        {
            var usersInProject = _context.ProjectUsers.Where(pu => pu.Project.Title == projectTitle).Select(u => u.User.Id).ToList();
            var usersNotInProject = _context.Users.Where(u => !usersInProject.Contains(u.Id))
            .OrderBy(u => u.UserName)
            .Select(u => u.UserName);
            return Ok(usersNotInProject);
        }

        [HttpGet("{username}/projects")]
        public ActionResult<IEnumerable<ProjectUser>> GetProjectsForUser(string username)
        {
            var projects = _context.ProjectUsers.Where(pu => pu.User.UserName == username).Select(p => p.Project);
            return Ok(projects);
        }

        [HttpGet("{projectTitle}/users")]
        public ActionResult<IEnumerable<string>> GetUsersForProject(string projectTitle)
        {
            var users = _context.ProjectUsers.Where(pu => pu.Project.Title == projectTitle).Select(u => u.User.UserName);
            return Ok(users);
        }
    }
}