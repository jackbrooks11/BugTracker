using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace API.Services
{
    public class AdminService : IAdminService
    {
        private readonly DataContext _context;
        private readonly UserManager<AppUser> _userManager;
        public AdminService(IConfiguration config, DataContext context,  UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }
        public async Task<PagedList<PaginatedUserDto>> GetUsersWithRoles(UserParams userParams)
        {
            var users = _userManager.Users
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
            return new PagedList<PaginatedUserDto>(usersReformatted, userLength, userParams.PageNumber, userParams.PageSize);
        }
        public async Task<string> ChangeRoles(AppUser user, string[] selectedRoles)
        {
            var userRoles = await _userManager.GetRolesAsync(user);

            var result = await _userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));

            if (!result.Succeeded) return "Failed to add to roles";

            result = await _userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));

            if (!result.Succeeded) return "Failed to remove from roles";

            return "";
        }

        public async Task<IList<string>> GetRoles(AppUser user)
        {
             return await _userManager.GetRolesAsync(user);
        }
    }
}    