using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IMapper _mapper;
        private readonly DataContext _context;
        public ProjectService(IMapper mapper, DataContext context)
        {
            _mapper = mapper;
            _context = context;
        }
        public async Task<Project> GetProject(string name)
        {
            return await _context.Projects
                .SingleOrDefaultAsync(x => x.Title == name);
        }
        public async Task<Project> GetProjectById(int id)
        {
            return await _context.Projects
                .SingleOrDefaultAsync(x => x.Id == id);
        }
        public IEnumerable<Project> GetProjects()
        {
            return _context.Projects;
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
        public void DeleteProjects(int[] projectIdsToDelete)
        {
            var projectsToDelete = GetProjectsToDelete(projectIdsToDelete);
            foreach (var project in projectsToDelete)
            {
                _context.Remove(project);
            }
        }
        public void CreateProject(Project project)
        {
            project.Title = project.Title.ToLower();
            _context.Projects.Add(project);
        }
        public async Task<string> ValidateProject(Project newProject)
        {
            if (await _context.Projects.AnyAsync(x => (x.Id != newProject.Id) && (x.Title == newProject.Title)))
            {
                return "Project title already taken.";
            }
            return "";
        }
        private IEnumerable<Project> GetProjectsToDelete(int[] projectIdsToDelete)
        {
            return GetProjects().Where(p => projectIdsToDelete.Contains(p.Id));
        }
        private IQueryable<Project> GetProjectQuery(ProjectParams projectParams)
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
            return query;
        }

        public void MarkProjectAsModified(Project project)
        {
            _context.Entry(project).State = EntityState.Modified;
        }
        public Project MapProject(Project projectUpdated, Project project)
        {
            _mapper.Map(projectUpdated, project);
            return project;
        }
        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}