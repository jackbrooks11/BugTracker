using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [Authorize(Policy = "RequireAdminRole")]
    public class AdminController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IAdminService _adminService;
        private readonly IUserService _userService;
        public AdminController(UserManager<AppUser> userManager, IAdminService adminService, IUserService userService)
        {
            _userManager = userManager;
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
        
        [HttpPost("ResetPassword")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            if (!ModelState.IsValid) return BadRequest("Essential information missing.");
            var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);
            if (user == null) return BadRequest("Invalid Request");
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetPassResult = await _userManager.ResetPasswordAsync(user, token, resetPasswordDto.Password);
            if (!resetPassResult.Succeeded) return BadRequest("Invalid Request");
            return Ok();
        }

        [HttpPost("ResetEmail")]
        public async Task<IActionResult> ResetEmail([FromBody] ResetEmailDto resetEmailDto)
        {
            if (!ModelState.IsValid) return BadRequest("Essential information missing.");
            var userWithNewEmail = await _userManager.FindByEmailAsync(resetEmailDto.Email);
            if (userWithNewEmail != null) return BadRequest("Email already taken.");
            var user = await _userManager.FindByNameAsync(resetEmailDto.Username);
            var token = await _userManager.GenerateChangeEmailTokenAsync(user, resetEmailDto.Email);
            var resetEmailResult = await _userManager.ChangeEmailAsync(user, resetEmailDto.Email, token);
            if (!resetEmailResult.Succeeded) return BadRequest("Invalid Request");
            return Ok();
        }
    }
}