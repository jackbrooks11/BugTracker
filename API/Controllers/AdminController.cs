using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AdminController : BaseApiController
    {
        private readonly UserManager<AppUser> __userManager;
        public AdminController(UserManager<AppUser> _userManager)
        {
            __userManager = _userManager;
        }

        [HttpGet("users-with-roles")]
        public async Task<ActionResult> GetUsersWithRoles([FromQuery] UserParams userParams)
        {
            var users = __userManager.Users
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

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("edit-roles/{username}")]
        public async Task<ActionResult> EditRoles(string username, [FromQuery] string roles)
        {
            if (roles == null) {
                return BadRequest("No roles selected");
            }
            var selectedRoles = roles.Split(",").ToArray();

            var user = await __userManager.FindByNameAsync(username);

            if (user == null) return NotFound("Could not find user");

            var userRoles = await __userManager.GetRolesAsync(user);

            var result = await __userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));

            if (!result.Succeeded) return BadRequest("Failed to add to roles");

            result = await __userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));

            if (!result.Succeeded) return BadRequest("Failed to remove from roles");

            return Ok(await __userManager.GetRolesAsync(user));
        }

    }
}