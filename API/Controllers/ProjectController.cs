using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class ProjectController : BaseApiController
    {
        private readonly IMapper _mapper;
        private readonly IProjectService _projectService;
        private readonly IProjectUserService _projectUserService;
        private readonly IAdminService _adminService;
        public ProjectController(IMapper mapper, IProjectService projectService,
        IProjectUserService projectUserService, IAdminService adminService)
        {
            _mapper = mapper;
            _projectService = projectService;
            _projectUserService = projectUserService;
            _adminService = adminService;
        }

        /// <summary>  
        /// Gets a specific projects
        /// </summary>  
        /// <param name="projectId"></param>   
        /// <returns>NotFound response if project not found, else Ok response</returns>
        [HttpGet("{projectId}", Name = "GetProject")]
        public async Task<ActionResult<Project>> GetProject(int projectId)
        {
            Project project = await _projectService.GetProjectById(projectId);
            if (project == null)
            {
                return NotFound("Project could not be found.");
            }
            return Ok(project);
        }

        /// <summary>  
        /// Gets all projects
        /// </summary>  
        /// <returns>All projects</returns>
        [HttpGet]
        public IEnumerable<Project> GetProjects()
        {
            return _projectService.GetProjects();
        }

        /// <summary>  
        /// Gets all projects in paginated format
        /// </summary>  
        /// <param name="projectParams"></param>   
        /// <returns>All projects paginated</returns>
        [HttpGet("paginated")]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjectsPaginated([FromQuery] ProjectParams projectParams)
        {
            if (projectParams == null)
            {
                return BadRequest("Project parameters not provided.");
            }
            PagedList<Project> projects = await _projectService.GetProjectsPaginated(projectParams);
            Response.AddPaginationHeader(projects.CurrentPage, projects.PageSize, projects.TotalCount, projects.TotalPages);
            return Ok(projects);
        }
        
        /// <summary>  
        /// Gets all projects for a specific user in paginated format
        /// </summary>  
        /// <param name="projectParams"></param>   
        /// <returns>All projects for a specific user in paginated format</returns>
        [HttpGet("user/projects")]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjectsForUser([FromQuery] ProjectParams projectParams)
        {
            if (projectParams == null)
            {
                return BadRequest("Project parameters not provided.");
            }
            // Get the logged in user's id.
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            PagedList<Project> projects = await _projectService.GetProjectsForUser(projectParams, int.Parse(userId));
            Response.AddPaginationHeader(projects.CurrentPage, projects.PageSize, projects.TotalCount, projects.TotalPages);
            return Ok(projects);
        }

        /// <summary>  
        /// Deletes projects specified by an admin
        /// </summary>  
        /// <param name="projectIdsToDelete"></param>   
        /// <returns>BadRequest response if projects not deleted, else NoContent response</returns>
        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("delete")]
        public async Task<ActionResult> DeleteProjects(int[] projectIdsToDelete)
        {
            if (projectIdsToDelete == null || projectIdsToDelete.Length <= 0)
            {
                return BadRequest("No projects to delete.");
            }
            _projectService.DeleteProjects(projectIdsToDelete);
            if (await _projectService.SaveAllAsync())
            {
                return NoContent();
            }
            return BadRequest("Failed to delete project(s)");
        }
        
        /// <summary>  
        /// Updates title and/or description of a project
        /// </summary>  
        /// <param name="projectUpdated"></param>   
        /// <returns>BadRequest response if project not updated, else NoContent response</returns>
        [Authorize(Policy = "RequireAdminRole")]
        [HttpPut]
        public async Task<ActionResult> UpdateProject(Project projectUpdated)
        {
            var errorMessage = await _projectService.ValidateProject(projectUpdated);
            // Errors found.
            if (errorMessage != "")
            {
                return BadRequest(errorMessage);
            }
            var project = await _projectService.GetProjectById(projectUpdated.Id);
            project = _projectService.MapProject(projectUpdated, project);
            _projectService.MarkProjectAsModified(project);
            if (await _projectService.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to update project");
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("create")]
        public async Task<ActionResult> CreateProject(Project project)
        {
            var errorMessage = await _projectService.ValidateProject(project);
            // Errors found.
            if (errorMessage != "")
            {
                return BadRequest(errorMessage);
            }
            _projectService.CreateProject(project);
            if (!(await _projectService.SaveAllAsync()))
            {
                return BadRequest("Failed to create project");
            }
            var newProject = await _projectService.GetProject(project.Title.ToLower());
            var admins = await _adminService.GetAdmins();
            foreach (var admin in admins)
            {
                _projectUserService.AddProjectUser(newProject, admin);
            }
            if (await _projectService.SaveAllAsync())
            {
                return NoContent();
            }
            return BadRequest("Failed to add admins to project");
        }
    }
}