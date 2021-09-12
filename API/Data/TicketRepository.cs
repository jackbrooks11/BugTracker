using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class TicketRepository : ITicketRepository
    {
        private readonly DataContext _context;
        public TicketRepository(DataContext context)
        {
            _context = context;
        }
        public async Task<Ticket> GetTicketByIdAsync(int id)
        {
            return await _context.Tickets.FindAsync(id);
        }
        public async Task<Ticket> GetTicketByTitleAsync(string title)
        {
            return await _context.Tickets
              .SingleOrDefaultAsync(x => x.Title == title);
        }
        public async Task<PagedList<Ticket>> GetTicketsAsync(TicketParams ticketParams)
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
            return await PagedList<Ticket>.CreateAsync(query, ticketParams.PageNumber, ticketParams.PageSize);
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
        public async Task<PagedList<Ticket>> GetTicketsForProjectAsync(string projectTitle, TicketForProjectParams ticketParams)
        {
            var query = _context.Tickets
            .AsNoTracking();
            if (ticketParams.SearchMatch != null)
            {
                query = query.Where(t => (t.Title.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.Title.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.AssignedTo.ToLower().Contains(ticketParams.SearchMatch.ToLower())));
            }
            if (!ticketParams.Ascending)
            {
                query = ticketParams.OrderBy switch
                {
                    "title" => query.OrderByDescending(t => t.Title),
                    "assignedTo" => query.OrderByDescending(t => t.AssignedTo),
                    _ => query.OrderByDescending(t => t.Created)

                };
            }
            else
            {
                query = ticketParams.OrderBy switch
                {
                    "title" => query.OrderBy(t => t.Title),
                    "assignedTo" => query.OrderBy(t => t.AssignedTo),
                    _ => query.OrderBy(t => t.Created)

                };
            }
            query = query.Where(t => t.Project.ToLower() == projectTitle.ToLower());
            return await PagedList<Ticket>.CreateAsync(query, ticketParams.PageNumber, ticketParams.PageSize);
        }
        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public void Update(Ticket ticket)
        {
            _context.Entry(ticket).State = EntityState.Modified;
        }

        public void Create(Ticket ticket)
        {
            _context.Tickets.Add(ticket);
        }

        public void Delete(int[] ticketIdsToDelete)
        {
            var ticketsToDelete = _context.Tickets.Where(t => ticketIdsToDelete.Contains(t.Id));
            foreach (var ticket in ticketsToDelete)
            {

                _context.Remove(ticket);
            }

        }

        public async Task<bool> TicketExists(string title)
        {
            return await _context.Tickets.AnyAsync(x => x.Title.ToLower() == title.ToLower());
        }
    }
}