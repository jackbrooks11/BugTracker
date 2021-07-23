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
            if (userParams.SearchMatch != null) {
                query = query.Where(u => (u.UserName.ToLower().Contains(userParams.SearchMatch.ToLower())));
            }
            query = query.OrderBy(u => u.UserName);
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

        public async Task<PagedList<Ticket>> GetTicketsForUserAsync(string username, TicketParams ticketParams)
        {
            var query = _context.Tickets
            .AsNoTracking();
            if (ticketParams.SearchMatch != null)
            {
                query = query.Where(t => (t.Title.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.Title.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.Project.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.AssignedTo.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.Priority.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.State.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.Type.ToLower().Contains(ticketParams.SearchMatch.ToLower())));
            }
            query = query.Where(t => t.AssignedTo.ToLower() == username.ToLower());
            return await PagedList<Ticket>.CreateAsync(query, ticketParams.PageNumber, ticketParams.PageSize);
        }

        public async void AddTicketForUserAsync(Ticket ticket)
        {
            var user = await this.GetUserByUsernameAsync(ticket.AssignedTo);
            user.Tickets.Add(ticket);
        }

    }
}