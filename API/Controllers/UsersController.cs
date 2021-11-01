using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
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
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> __userManager;
        public UsersController(DataContext context, UserManager<AppUser> _userManager, IMapper mapper)
        {
            _context = context;
            __userManager = _userManager;
            _mapper = mapper;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppUser>>> GetUsers([FromQuery] UserParams userParams)
        {
            var query = _context.Users
                .AsNoTracking();
            if (userParams.SearchMatch != null)
            {
                query = query.Where(u => (u.UserName.ToLower().Contains(userParams.SearchMatch.ToLower())));
            }
            query = query.OrderBy(u => u.UserName);
            var users = await PagedList<AppUser>.CreateAsync(query, userParams.PageNumber, userParams.PageSize);
            Response.AddPaginationHeader(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages);

            return Ok(users);
        }

        [HttpGet("{username}", Name = "GetUser")]
        public async Task<ActionResult<AppUser>> GetUser(string username)
        {
            return await _context.Users
                 .Include(t => t.Tickets)
                 .SingleOrDefaultAsync(x => x.UserName == username);

        }

        [HttpPut]
        public async Task<ActionResult<AppUser>> UpdateUser(EditMemberDto partialUser)
        {
            var username = User.GetUsername();
            var user = await _context.Users
                 .Include(t => t.Tickets)
                 .SingleOrDefaultAsync(x => x.UserName == username);
            _mapper.Map(partialUser, user);

            /*Update user password*/
            if (partialUser.Password != "")
            {
                var token = await __userManager.GeneratePasswordResetTokenAsync(user);
                var result = await __userManager.ResetPasswordAsync(user, token, partialUser.Password);
                if (!result.Succeeded)
                {
                    return BadRequest("Inadequate Password");
                }
            }
            _context.Entry(user).State = EntityState.Modified;

            if (await _context.SaveChangesAsync() > 0) return user;

            return BadRequest("Failed to update user");
        }

        /* Create separate controller for roles */
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
    }
}