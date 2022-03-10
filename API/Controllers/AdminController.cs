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
    public class AdminController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IAdminService _adminService;
        private readonly IUserService _userService;
        private readonly IAccountService _accountService;
        private readonly IEmailService _emailService;
        public AdminController(UserManager<AppUser> userManager, IAdminService adminService, IUserService userService,
        IAccountService accountService, IEmailService emailService)
        {
            _userManager = userManager;
            _adminService = adminService;
            _userService = userService;
            _accountService = accountService;
            _emailService = emailService;
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
            if (roles == null)
            {
                return BadRequest("No roles selected");
            }
            var selectedRoles = roles.Split(",").ToArray();

            var user = await _userService.GetUserByUsernameAsync(username);

            if (user == null) return NotFound("Could not find user");

            string result = await _adminService.ChangeRoles(user, selectedRoles);
            if (result != "")
            {
                return BadRequest(result);
            }
            return Ok(await _adminService.GetRoles(user));
        }

        [Authorize(Policy = "RequireAdminRole")]
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

        [Authorize(Policy = "RequireAdminRole")]
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

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("SendConfirmationEmail")]
        public async Task<IActionResult> SendConfirmationEmail([FromBody] SendConfirmationEmailDto sendConfirmationEmailDto)
        {
            if (!ModelState.IsValid) return BadRequest("Essential information missing.");
            var user = await _userManager.FindByEmailAsync(sendConfirmationEmailDto.Email);
            if (user == null) return BadRequest("Invalid Request");
            var mail = await _emailService.CreateEmail(sendConfirmationEmailDto.ClientURI, sendConfirmationEmailDto.Email, user);
            var emailSent = _emailService.SendEmail(mail);
            if (!emailSent) return BadRequest("Email can not be sent.");
            return Ok();
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("createUser")]
        public async Task<ActionResult> CreateUser(RegisterDto registerDto)
        {
            if (!ModelState.IsValid) return BadRequest("Essential information missing.");
            var userExists = await _accountService.UserExists(registerDto);
            if (userExists != "") return BadRequest(userExists);
            var result = await _accountService.CreateUser(registerDto);
            if (result != null) return BadRequest(result);
            var user = await _userService.GetUserByUsernameAsync(registerDto.Username);
            user.EmailConfirmed = true;
            if (await _adminService.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to create user");
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("deleteUsers")]
        public async Task<ActionResult> DeleteUsers(int[] userIdsToDelete)
        {
            _adminService.DeleteUsers(userIdsToDelete);

            if (await _adminService.SaveAllAsync()) return NoContent();

            return BadRequest("Failed to delete user(s)");
        }
    }
}