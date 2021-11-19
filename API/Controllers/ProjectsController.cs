using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using API.Extensions;
using API.Helpers;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    public class ProjectsController : BaseApiController
    {
        private readonly IMapper _mapper;
        private readonly DataContext _context;

        public ProjectsController(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]

        public async Task<ActionResult<IEnumerable<Project>>> GetProjects() {
            var projects = await _context.Projects.AsNoTracking().AnyAsync();
            return Ok(projects);
        }

        [HttpGet("paginated")]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjectsPaginated([FromQuery] ProjectParams projectParams)
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
            var projects = await PagedList<Project>.CreateAsync(query, projectParams.PageNumber, projectParams.PageSize);

            Response.AddPaginationHeader(projects.CurrentPage, projects.PageSize, projects.TotalCount, projects.TotalPages);

            return Ok(projects);
        }

        [HttpGet("{id}", Name = "GetProject")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            var project = await _context.Projects
                .Include(t => t.Tickets)
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Id == id);
            return Ok(project);
        }


        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("create")]
        public async Task<ActionResult> CreateProject(Project project)
        {
            if (await _context.Projects.AnyAsync(x => x.Title.ToLower() == project.Title.ToLower()))
            {
                return BadRequest("Project title taken");
            }

            _context.Projects.Add(project);

            if (await _context.SaveChangesAsync() > 0) return NoContent();

            return BadRequest("Failed to create project");
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPut]
        public async Task<ActionResult> UpdateProject(Project projectUpdated)
        {
            var project = await _context.Projects
                .Include(t => t.Tickets)
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Id == projectUpdated.Id);
            if (await _context.Projects.AnyAsync(x => x.Title.ToLower() == projectUpdated.Title.ToLower()) && projectUpdated.Title != project.Title)
            {
                return BadRequest("Project title already taken.");
            }
            _mapper.Map(projectUpdated, project);
            _context.Entry(project).State = EntityState.Modified;
            if (await _context.SaveChangesAsync() > 0) return NoContent();
            return BadRequest("Failed to update project");
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("delete")]
        public async Task<ActionResult> DeleteProjects(int[] projectIdsToDelete)
        {
            var projectsToDelete = _context.Projects.Where(p => projectIdsToDelete.Contains(p.Id))
            .Include(t => t.Tickets);

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

            if (await _context.SaveChangesAsync() > 0) return NoContent();

            return BadRequest("Failed to delete projects");
        }

        [HttpGet("member/projects")]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjectsForUser([FromQuery] ProjectParams projectParams)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var query = _context.Projects.Where(pu => pu.ProjectUsers.Any(p => p.UserId == int.Parse(userId)))
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
            var projects = await PagedList<Project>.CreateAsync(query, projectParams.PageNumber, projectParams.PageSize);

            Response.AddPaginationHeader(projects.CurrentPage, projects.PageSize, projects.TotalCount, projects.TotalPages);

            return Ok(projects);
        }
    }
}