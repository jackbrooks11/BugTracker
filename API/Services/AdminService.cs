using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class AdminService : IAdminService
    {
        private readonly IMapper _mapper;
        private readonly DataContext _context;
        private readonly UserManager<AppUser> _userManager;
        public AdminService(IMapper mapper, DataContext context, UserManager<AppUser> userManager)
        {
            _mapper = mapper;
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
                || u.UserName.ToLower().Contains(userParams.SearchMatch)
                || u.Email.ToLower().Contains(userParams.SearchMatch));
            }
            var userLength = users.Count();
            if (!userParams.Ascending)
            {
                users = userParams.OrderBy switch
                {
                    "email" => users.OrderByDescending(u => u.Email),
                    _ => users.OrderByDescending(u => u.UserName)
                };
            }
            else
            {
                users = userParams.OrderBy switch
                {
                    "email" => users.OrderBy(u => u.Email),
                    _ => users.OrderBy(u => u.UserName)
                };
            }
            users = users
                .Skip((userParams.PageNumber - 1) * userParams.PageSize)
                .Take(userParams.PageSize);
            var userList = await users
            .Select(u => new
            {
                u.Id,
                Username = u.UserName,
                Email = u.Email,
                EmailConfirmed = u.EmailConfirmed,
                Roles = u.UserRoles.Select(r => r.Role.Name).ToList()
            }).ToListAsync();
            var usersReformatted = new List<PaginatedUserDto>();
            foreach (var user in userList)
            {
                usersReformatted.Add(new PaginatedUserDto(user.Id, user.Username, user.Roles, user.Email, user.EmailConfirmed));
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
        public void DeleteUsers(int[] userIdsToDelete)
        {
            var usersToDelete = GetUsersToDelete(userIdsToDelete);
            foreach (var user in usersToDelete)
            {
                _context.Remove(user);
            };
        }
        private IEnumerable<AppUser> GetUsersToDelete(int[] userIdsToDelete)
        {
            return _context.Users.Where(u => userIdsToDelete.Contains(u.Id)).AsNoTracking();
        }

        public async Task<IList<string>> GetRoles(AppUser user)
        {
            return await _userManager.GetRolesAsync(user);
        }
        public AppUser MapUser(RegisterDto registerDto, AppUser user)
        {
            _mapper.Map<RegisterDto, AppUser>(registerDto, user);
            return user;
        }
        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<AppUser>> GetAdmins()
        {
            return await _context.Users.Where(u => u.UserRoles.Any(r => r.Role.Name == "Admin")).ToListAsync();
        }
    }
}