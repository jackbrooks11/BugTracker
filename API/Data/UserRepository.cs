using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class UserRepository : IUserRepository
    {
        private readonly DataContext _context;
        public UserRepository(DataContext context)
        {
            _context = context;
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


        public async Task<PagedList<AppUser>> GetUsersAsync(UserParams userParams)
        {
            var query = _context.Users
            .AsNoTracking();
            if (userParams.SearchMatch != null)
            {
                query = query.Where(u => (u.UserName.ToLower().Contains(userParams.SearchMatch.ToLower())));
            }
            query = query.OrderBy(u => u.UserName);
            return await PagedList<AppUser>.CreateAsync(query, userParams.PageNumber, userParams.PageSize);
        }
        public async Task<PagedList<AppUser>> GetUsersForProjectAsync(int id, UserParams userParams)
        {
            var query = _context.Users.Where(pu => pu.ProjectUsers.Any(u => u.ProjectId == id))
            .AsNoTracking();
            query = userParams.OrderBy switch
            {
                _ => query.OrderBy(u => u.UserName)
            };
            return await PagedList<AppUser>.CreateAsync(query, userParams.PageNumber, userParams.PageSize);
        }


        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public void Update(AppUser user)
        {
            _context.Entry(user).State = EntityState.Modified;
        }
        public async void AddTicketForUserAsync(Ticket ticket)
        {
            var user = await this.GetUserByUsernameAsync(ticket.AssignedTo);
            user.Tickets.Add(ticket);
        }

    }
}