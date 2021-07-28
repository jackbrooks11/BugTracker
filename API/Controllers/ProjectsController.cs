using System.Collections.Generic;
using System.Threading.Tasks;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class ProjectsController : BaseApiController
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IUserRepository _userRepository;
        public ProjectsController(IProjectRepository projectRepository)
        {
            _projectRepository = projectRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProject([FromQuery] ProjectParams projectParams)
        {
            var projects = await _projectRepository.GetProjectsAsync(projectParams);

            Response.AddPaginationHeader(projects.CurrentPage, projects.PageSize, projects.TotalCount, projects.TotalPages);

            return Ok(projects);
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("create")]
        public async Task<ActionResult> CreateProject(Project project)
        {
            if (await _projectRepository.ProjectExists(project.Title))
            {
                return BadRequest("Project title taken");
            }

            _projectRepository.Create(project);

            if (await _projectRepository.SaveAllAsync()) return NoContent();

            return BadRequest("Failed to create ticket");
        }

        
        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("delete")]
        public async Task<ActionResult> DeleteProjects(int[] projectIdsToDelete)
        {
            _projectRepository.Delete(projectIdsToDelete);
            
            if (await _projectRepository.SaveAllAsync()) return NoContent();

            return BadRequest("Failed to delete projects");
        }
        
    }
}