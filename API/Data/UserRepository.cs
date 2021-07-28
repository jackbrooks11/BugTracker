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
             if (!ticketParams.Ascending)
            {
                query = ticketParams.OrderBy switch
                {
                    "title" => query.OrderByDescending(t => t.Title),
                    "project" => query.OrderByDescending(t => t.Project),
                    "assignedTo" => query.OrderByDescending(t => t.AssignedTo),
                    "priority" => query.OrderByDescending(t => (t.Priority == "High" ? 3 :
                    t.Priority == "Medium" ? 2 :
                    1)),
                    "state" => query.OrderByDescending(t => t.State),
                    "type" => query.OrderByDescending(t => t.Type),
                    _ => query.OrderByDescending(t => t.Created)

                };
            }
            else
            {
                query = ticketParams.OrderBy switch
                {
                    "title" => query.OrderBy(t => t.Title),
                    "project" => query.OrderBy(t => t.Project),
                    "assignedTo" => query.OrderBy(t => t.AssignedTo),
                    "priority" => query.OrderBy(t => (t.Priority == "High" ? 3 :
                    t.Priority == "Medium" ? 2 :
                    1)),
                    "state" => query.OrderBy(t => t.State),
                    "type" => query.OrderBy(t => t.Type),
                    _ => query.OrderBy(t => t.Created)

                };
            }
            query = query.Where(t => t.AssignedTo.ToLower() == username.ToLower());
            return await PagedList<Ticket>.CreateAsync(query, ticketParams.PageNumber, ticketParams.PageSize);
        }

        public async Task<PagedList<Project>> GetProjectsForUserAsync(int id, ProjectParams projectParams)
        {
            var query = _context.Projects.Where(pu => pu.ProjectUsers.Any(p => p.UserId == id))
            .AsNoTracking();
            if (projectParams.SearchMatch != null)
            {
                query = query.Where(p => (p.Title.ToLower().Contains(projectParams.SearchMatch.ToLower()) ||
                p.Description.ToLower().Contains(projectParams.SearchMatch.ToLower())));
            }
            if (!projectParams.Ascending)
            {
                query = projectParams.OrderBy switch
                {
                    "title" => query.OrderByDescending(p => p.Title),
                    "description" => query.OrderByDescending(p => p.Description),
                    _ => query.OrderByDescending(t => t.Created)
                };
            }
            else
            {
                query = projectParams.OrderBy switch
                {
                    "title" => query.OrderBy(p => p.Title),
                    "description" => query.OrderBy(p => p.Description),
                    _ => query.OrderBy(t => t.Created)

                };
            }
            return await PagedList<Project>.CreateAsync(query, projectParams.PageNumber, projectParams.PageSize);
        }
        public async void AddTicketForUserAsync(Ticket ticket)
        {
            var user = await this.GetUserByUsernameAsync(ticket.AssignedTo);
            user.Tickets.Add(ticket);
        }

    }
}