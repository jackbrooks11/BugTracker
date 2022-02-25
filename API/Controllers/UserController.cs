using System.Collections.Generic;
using System.Threading.Tasks;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class UserController : BaseApiController
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("{username}", Name = "GetUser")]
        public async Task<ActionResult<AppUser>> GetUser(string username)
        {
            var user = await _userService.GetUserByUsernameAsync(username);
            if (user == null) {
                return NotFound("User could not be found.");
            }
            return Ok(user);
        }

        [HttpGet("{username}/roles")]
        public async Task<ActionResult<List<string>>> GetUserRoles(string username)
        {
            var roles = await _userService.GetRoles(username);
            if (roles == null) {
                return NotFound("Roles for user could not be found.");
            }
            return Ok(roles);
        }
    }
}