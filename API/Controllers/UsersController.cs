using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IUserRepository _userRepository;
        private readonly IProjectRepository _projectRepository;

        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> __userManager;
        public UsersController(IUserRepository userRepository, IProjectRepository projectRepository, UserManager<AppUser> _userManager, IMapper mapper)
        {
            __userManager = _userManager;
            _mapper = mapper;
            _userRepository = userRepository;
            _projectRepository = projectRepository;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppUser>>> GetUsers([FromQuery] UserParams userParams)
        {
            var users = await _userRepository.GetUsersAsync(userParams);

            Response.AddPaginationHeader(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages);

            return Ok(users);
        }

        [HttpGet("{username}", Name = "GetUser")]
        public async Task<ActionResult<AppUser>> GetUser(string username)
        {
            return await _userRepository.GetUserByUsernameAsync(username);

        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(AppUser appUser)
        {
            var username = User.GetUsername();
            var user = await _userRepository.GetUserByUsernameAsync(username);
            _mapper.Map(appUser, user);
            _userRepository.Update(user);

            if (await _userRepository.SaveAllAsync()) return NoContent();

            return BadRequest("Failed to update user");
        }

        [HttpGet("{username}/roles")]
        public async Task<ActionResult> GetUserRoles(string username)
        {
            var roles = await __userManager.Users
                .Where(u => u.UserName == username)
                .Include(r => r.UserRoles)
                .ThenInclude(r => r.Role)
                .Select(u => new
                {
                    Roles = u.UserRoles.Select(r => r.Role.Name).ToList()
                })
                .ToListAsync();

            return Ok(roles[0]);
        }

        [HttpGet("{projectTitle}/users")]
        public async Task<ActionResult<IEnumerable<AppUser>>> GetUsersForProject(string projectTitle, [FromQuery] UserParams userParams)
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

    }
}