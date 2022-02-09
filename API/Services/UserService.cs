using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace API.Services
{
    public class UserService : IUserService
    {
        private readonly DataContext _context;
        private readonly UserManager<AppUser> _userManager;
        public UserService(IConfiguration config, DataContext context,  UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }
        public async Task<AppUser> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<AppUser> GetUserByUsernameAsync(string username)
        {
            return await _context.Users
                .Include(t => t.Tickets)
                .SingleOrDefaultAsync(x => x.UserName == username);
        }
        public async Task<List<string>> GetRoles(string username)
        {
            var roles = await _userManager.Users
                .Where(u => u.UserName == username)
                .Include(r => r.UserRoles)
                .ThenInclude(r => r.Role)
                .Select(u =>
                    u.UserRoles.Select(r => r.Role.Name).ToList()
                )
                .ToListAsync();
            return roles[0];
        }

        public void MarkUserAsModified(AppUser user) {
            _context.Entry(user).State = EntityState.Modified;
        }
        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}    