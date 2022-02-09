using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    public class ProjectUsersController : BaseApiController
    {
        private readonly DataContext _context;
        private readonly UserManager<AppUser> __userManager;
        private readonly IProjectUserService _projectUserService;
        private readonly IProjectService _projectService;
        private readonly IUserService _userService;
        public ProjectUsersController(DataContext context, UserManager<AppUser> _userManager, IProjectUserService projectUserService, IProjectService projectService,
        IUserService userService)
        {
            _context = context;
            __userManager = _userManager;
            _projectUserService = projectUserService;
            _projectService = projectService;
            _userService = userService;
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("{projectId}/deleteUsers")]
        public async Task<ActionResult> DeleteProjectUsers(DeleteUsersFromProjectDto usernamesToDelete)
        {
            var project = usernamesToDelete.Project;
            _projectUserService.DeleteProjectUsers(project, usernamesToDelete);
            if (await _projectService.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to delete user from project");
        }

        [HttpPost("{projectId}/addUser")]
        public async Task<ActionResult> AddProjectUser(ProjectUserDto projectUserDto)
        {
            var project = await _projectService.GetProjectById(projectUserDto.ProjectId);
            var user = await _userService.GetUserByUsernameAsync(projectUserDto.Username);
            _projectUserService.AddProjectUser(project, user);
            if (await _projectService.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to add user to project");
        }

        [HttpGet("{projectTitle}/usersPaginated")]
        public async Task<ActionResult<IEnumerable<AppUser>>> GetUsersForProjectPaginated([FromQuery] UserParams userParams, string projectTitle)
        {
            var usersPaginated = await _projectUserService.GetUsersForProjectPaginated(userParams, projectTitle);
            Response.AddPaginationHeader(usersPaginated.CurrentPage, usersPaginated.PageSize, usersPaginated.TotalCount, usersPaginated.TotalPages);
            return Ok(usersPaginated);
        }

        [HttpGet("{projectTitle}/usersNotInProject")]
        public ActionResult<IEnumerable<string>> GetUsersNotInProject(string projectTitle)
        {
            return Ok(_projectUserService.GetUsersNotInProject(projectTitle));
        }

        [HttpGet("{username}/projects")]
        public ActionResult<IEnumerable<Project>> GetProjectsForUser(string username)
        {
            return Ok(_projectUserService.GetProjectsForUser(username));
        }

        [HttpGet("{projectTitle}/users")]
        public ActionResult<IEnumerable<string>> GetUsersForProject(string projectTitle)
        {
            return Ok(_projectUserService.GetUsersForProject(projectTitle));
        }
    }
}