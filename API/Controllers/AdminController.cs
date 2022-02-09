using System.Linq;
using System.Threading.Tasks;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class AdminController : BaseApiController
    {
        private readonly IAdminService _adminService;
        private readonly IUserService _userService;
        public AdminController(IAdminService adminService, IUserService userService)
        {
            _adminService = adminService;
            _userService = userService;
        }

        [HttpGet("users-with-roles")]
        public async Task<ActionResult> GetUsersWithRoles([FromQuery] UserParams userParams)
        {
            var usersPaginated = await _adminService.GetUsersWithRoles(userParams);

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

            var user = await _userService.GetUserByUsernameAsync(username);

            if (user == null) return NotFound("Could not find user");

            string result = await _adminService.ChangeRoles(user, selectedRoles);
            if (result != "") {
                return BadRequest(result);
            }
            return Ok(await _adminService.GetRoles(user));
        }
    }
}