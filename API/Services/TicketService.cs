using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace API.Services
{
    public class TicketService : ITicketService
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public TicketService(IConfiguration config, IMapper mapper, DataContext context)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<Ticket> GetTicket(int id)
        {
            return await _context.Tickets.Include(x => x.Comments).Include(c => c.Changes).FirstOrDefaultAsync(y => y.Id == id);
        }
        public IEnumerable<Ticket> GetTickets()
        {
            return _context.Tickets.Include(c => c.Changes).AsNoTracking();
        }
        public async Task<PagedList<Ticket>> GetTicketsPaginated(TicketParams ticketParams)
        {
            var query = GetTicketQuery(ticketParams);
            return await PagedList<Ticket>.CreateAsync(query, ticketParams.PageNumber, ticketParams.PageSize);
        }
        public async Task<PagedList<Ticket>> GetTicketsForUser(TicketParams ticketParams, string username)
        {
            var query = GetTicketQuery(ticketParams);
            query = query.Where(t => t.Assignee.ToLower() == username.ToLower());
            return await PagedList<Ticket>.CreateAsync(query, ticketParams.PageNumber, ticketParams.PageSize);
        }
        public async Task<PagedList<Ticket>> GetTicketsForProject(TicketParams ticketParams, string projectTitle)
        {
            var query = GetTicketQuery(ticketParams);
            query = query.Where(t => t.Project.ToLower() == projectTitle.ToLower());
            return await PagedList<Ticket>.CreateAsync(query, ticketParams.PageNumber, ticketParams.PageSize);
        }
        public void DeleteTickets(int[] ticketIdsToDelete) {
            var ticketsToDelete = GetTicketsToDelete(ticketIdsToDelete);
            foreach (var ticket in ticketsToDelete)
            {
                _context.Remove(ticket);
            };
        }
        public async Task<string> ValidateTicket(Ticket ticket, Project project)
        {
            if (ticket.Project == "")
            {
                return "Project field can not be empty";
            }
            if (project == null)
            {

                return "Project does not exist";
            }
            var assigneeCheck = await _context.ProjectUsers.AsNoTracking().AnyAsync(pu => pu.ProjectId == project.Id && pu.User.UserName.ToLower() == ticket.Assignee.ToLower());

            if (!assigneeCheck && ticket.Assignee != "Unassigned")
            {
                return "User assigned to ticket does not belong to project";
            }

            if (await _context.Users
                .Include(t => t.Tickets)
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.UserName == ticket.Assignee) == null && ticket.Assignee != "Unassigned")
            {
                return "User assigned to ticket does not exist";
            }
            if (ticket.Title.Length == 0)
            {
                return "Ticket must have a title";
            }
            return "";
        }
        public void AddChangesToTicket(Ticket ticket, Ticket newTicket)
        {
            if (ticket.Title != newTicket.Title)
            {
                AddChangeToTicket(ticket, newTicket, "Title");
            }
            if (ticket.Description != newTicket.Description)
            {
                AddChangeToTicket(ticket, newTicket, "Description");
            }
            if (ticket.Type != newTicket.Type)
            {
                AddChangeToTicket(ticket, newTicket, "Type");
            }
            if (ticket.Project != newTicket.Project)
            {
                AddChangeToTicket(ticket, newTicket, "Project");
            }
            if (ticket.Priority != newTicket.Priority)
            {
                AddChangeToTicket(ticket, newTicket, "Priority");
            }
            if (ticket.State != newTicket.State)
            {
                AddChangeToTicket(ticket, newTicket, "State");
            }
            if (ticket.Assignee != newTicket.Assignee)
            {
                AddChangeToTicket(ticket, newTicket, "Assignee");
            }
            _mapper.Map(newTicket, ticket);
            ticket.LastEdited = DateTime.Now;
        }
        public void AddChangeToTicket(Ticket ticket, Ticket newTicket, string property)
        {
            TicketPropertyChange change = new TicketPropertyChange();
            change.Property = property;
            change.Editor = newTicket.Submitter;
            change.Changed = DateTime.Now;
            if (property == "Title")
            {
                change.OldValue = ticket.Title;
                change.NewValue = newTicket.Title;
            }
            else if (property == "Description")
            {
                change.OldValue = ticket.Description;
                change.NewValue = newTicket.Description;
            }
            else if (property == "Type")
            {
                change.OldValue = ticket.Type;
                change.NewValue = newTicket.Type;
            }
            else if (property == "Project")
            {
                change.OldValue = ticket.Project;
                change.NewValue = newTicket.Project;
            }
            else if (property == "Priority")
            {
                change.OldValue = ticket.Priority;
                change.NewValue = newTicket.Priority;
            }
            else if (property == "State")
            {
                change.OldValue = ticket.State;
                change.NewValue = newTicket.State;
            }
            else if (property == "Assignee")
            {
                change.OldValue = ticket.Assignee;
                change.NewValue = newTicket.Assignee;
            }
            newTicket.Changes.Add(change);
        }
        private IEnumerable<Ticket> GetTicketsToDelete(int[] ticketIdsToDelete)
        {
            return _context.Tickets.Where(t => ticketIdsToDelete.Contains(t.Id));
        }
       private IQueryable<Ticket> GetTicketQuery(TicketParams ticketParams) {
            var query = _context.Tickets
                .Include(t => t.Comments)
                .Include(x => x.Changes)
                .AsNoTracking();
            if (ticketParams.SearchMatch != null)
            {
                query = query.Where(t => (t.Title.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.Title.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.Assignee.ToLower().Contains(ticketParams.SearchMatch.ToLower())));
            }
            if (!ticketParams.Ascending)
            {
                query = ticketParams.OrderBy switch
                {
                    "title" => query.OrderByDescending(t => t.Title),
                    "project" => query.OrderByDescending(t => t.Project),
                    "assignee" => query.OrderByDescending(t => t.Assignee),
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
                    "assignee" => query.OrderBy(t => t.Assignee),
                    "priority" => query.OrderBy(t => (t.Priority == "High" ? 3 :
                    t.Priority == "Medium" ? 2 :
                    1)),
                    "state" => query.OrderBy(t => t.State),
                    "type" => query.OrderBy(t => t.Type),
                    _ => query.OrderBy(t => t.Created)
                };
            }
            return query;
        } 
        public void MarkTicketAsModified(Ticket ticket) {
            _context.Entry(ticket).State = EntityState.Modified;
        }
        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}