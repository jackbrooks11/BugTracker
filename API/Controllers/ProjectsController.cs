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
    public class ProjectsController : BaseApiController
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public ProjectsController(IProjectRepository projectRepository, IUserRepository userRepository, IMapper mapper)
        {

            _userRepository = userRepository;
            _projectRepository = projectRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects([FromQuery] ProjectParams projectParams)
        {
            var projects = await _projectRepository.GetProjectsAsync(projectParams);

            Response.AddPaginationHeader(projects.CurrentPage, projects.PageSize, projects.TotalCount, projects.TotalPages);

            return Ok(projects);
        }

        [HttpGet("{id}", Name = "GetProject")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            var project = await _projectRepository.GetProjectByIdAsync(id);
            return Ok(project);
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
        [HttpPut]
        public async Task<ActionResult> UpdateProject(Project projectUpdated)
        {
            var project = await _projectRepository.GetProjectByIdAsync(projectUpdated.Id);
            if (await _projectRepository.ProjectExists(projectUpdated.Title) && projectUpdated.Title != project.Title)
            {
                return BadRequest("Project title already taken.");
            }
            _mapper.Map(projectUpdated, project);
            _projectRepository.Update(project);
            if (await _projectRepository.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to update project");
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("delete")]
        public async Task<ActionResult> DeleteProjects(int[] projectIdsToDelete)
        {
            _projectRepository.Delete(projectIdsToDelete);

            if (await _projectRepository.SaveAllAsync()) return NoContent();

            return BadRequest("Failed to delete projects");
        }

        [HttpGet("member/projects")]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjectsForUser([FromQuery] ProjectParams projectParams)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var projects = await _projectRepository.GetProjectsForUserAsync(int.Parse(userId), projectParams);

            return Ok(projects);
        }

    }
}