using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using API.Extensions;
using API.Helpers;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    public class TicketsController : BaseApiController
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public TicketsController(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]

        public IEnumerable<Ticket> GetTickets()
        {
            var tickets = _context.Tickets.Include(c => c.Changes).AsNoTracking();
            return tickets;
        }

        [HttpGet("paginated")]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTicketsPaginated([FromQuery] TicketParams ticketParams)
        {
            var query = _context.Tickets
                .Include(t => t.Comments)
                .Include(x => x.Changes)
                .AsNoTracking();
            if (ticketParams.SearchMatch != null)
            {
                query = query.Where(t => (t.Title.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.Title.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.Project.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.Assignee.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
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
            var tickets = await PagedList<Ticket>.CreateAsync(query, ticketParams.PageNumber, ticketParams.PageSize);

            Response.AddPaginationHeader(tickets.CurrentPage, tickets.PageSize, tickets.TotalCount, tickets.TotalPages);

            return Ok(tickets);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetTicket(int id)
        {
            return await _context.Tickets.Include(x => x.Comments).Include(c => c.Changes).AsNoTracking().FirstOrDefaultAsync(y => y.Id == id);
        }

        [HttpPost("create")]
        public async Task<ActionResult> CreateTicket(Ticket ticket)
        {
            var project = await _context.Projects
                  .Include(t => t.Tickets)
                  .SingleOrDefaultAsync(x => x.Title == ticket.Project);
            if (ticket.Assignee.Length > 0)
            {
                var user = await _context.Users
                    .Include(t => t.Tickets)
                    .SingleOrDefaultAsync(x => x.UserName == ticket.Assignee);
                user.Tickets.Add(ticket);
            }
            project.Tickets.Add(ticket);
            _context.Tickets.Add(ticket);

            if (await _context.SaveChangesAsync() > 0) return NoContent();

            return BadRequest("Failed to create ticket");
        }

        [HttpPut]
        public async Task<ActionResult> UpdateTicket(Ticket ticketUpdated)
        {
            var project = await _context.Projects
                .Include(t => t.Tickets)
                .SingleOrDefaultAsync(x => x.Title == ticketUpdated.Project);
            var errorMessage = await ValidateTicket(ticketUpdated, project);
            if (errorMessage != "")
            {
                return BadRequest(errorMessage);
            }
            var id = ticketUpdated.Id;
            var ticket = await _context.Tickets.Include(x => x.Comments).FirstOrDefaultAsync(y => y.Id == id);
            AddChangesToTicket(ticket, ticketUpdated);
            _mapper.Map(ticketUpdated, ticket);
            ticket.LastEdited = DateTime.Now;
            project.Tickets.Add(ticket);

            if (await _context.SaveChangesAsync() > 0) return NoContent();

            return BadRequest("Failed to update ticket");
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("delete")]
        public async Task<ActionResult> DeleteTickets(int[] ticketIdsToDelete)
        {
            var ticketsToDelete = _context.Tickets.Where(t => ticketIdsToDelete.Contains(t.Id));
            foreach (var ticket in ticketsToDelete)
            {

                _context.Remove(ticket);
            }

            if (await _context.SaveChangesAsync() > 0) return NoContent();

            return BadRequest("Failed to delete tickets");
        }

        [HttpGet("member/tickets")]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTicketsForUser([FromQuery] TicketParams ticketParams)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var query = _context.Tickets
                .AsNoTracking();
            if (ticketParams.SearchMatch != null)
            {
                query = query.Where(t => (t.Title.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.Title.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.Project.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.Assignee.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
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
            query = query.Where(t => t.Assignee.ToLower() == username.ToLower());

            var tickets = await PagedList<Ticket>.CreateAsync(query, ticketParams.PageNumber, ticketParams.PageSize);

            Response.AddPaginationHeader(tickets.CurrentPage, tickets.PageSize, tickets.TotalCount, tickets.TotalPages);

            return Ok(tickets);
        }

        [HttpGet("{projectTitle}/tickets")]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTicketsForProject(string projectTitle, [FromQuery] TicketParams ticketParams)
        {
            var query = _context.Tickets
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
            query = query.Where(t => t.Project.ToLower() == projectTitle.ToLower());

            var tickets = await PagedList<Ticket>.CreateAsync(query, ticketParams.PageNumber, ticketParams.PageSize);

            Response.AddPaginationHeader(tickets.CurrentPage, tickets.PageSize, tickets.TotalCount, tickets.TotalPages);

            return Ok(tickets);
        }
        private async Task<string> ValidateTicket(Ticket ticket, Project project)
        {
            var userParams = new UserParams();
            if (ticket.Project == "")
            {
                return "Project field can not be empty";
            }
            if (!await _context.Projects.AsNoTracking().AnyAsync(x => x.Title.ToLower() == ticket.Project.ToLower()))
            {

                return "Project does not exist";
            }

            /*Get Users for Project*/

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
                Response.StatusCode = 400;
                return "User assigned to ticket does not exist";
            }
            if (ticket.Title.Length == 0)
            {
                Response.StatusCode = 400;
                return "Ticket must have a title";
            }
            return "";
        }

        private void AddChangesToTicket(Ticket ticket, Ticket ticketUpdated)
        {
            if (ticket.Title != ticketUpdated.Title)
            {
                AddChangeToTicket(ticket, ticketUpdated, "Title");
            }
            if (ticket.Description != ticketUpdated.Description)
            {
                AddChangeToTicket(ticket, ticketUpdated, "Description");
            }
            if (ticket.Type != ticketUpdated.Type)
            {
                AddChangeToTicket(ticket, ticketUpdated, "Type");
            }
            if (ticket.Project != ticketUpdated.Project)
            {
                AddChangeToTicket(ticket, ticketUpdated, "Project");
            }
            if (ticket.Priority != ticketUpdated.Priority)
            {
                AddChangeToTicket(ticket, ticketUpdated, "Priority");
            }
            if (ticket.State != ticketUpdated.State)
            {
                AddChangeToTicket(ticket, ticketUpdated, "State");
            }
            if (ticket.Assignee != ticketUpdated.Assignee)
            {
                AddChangeToTicket(ticket, ticketUpdated, "Assignee");
            }
        }

        private void AddChangeToTicket(Ticket ticket, Ticket ticketUpdated, string property)
        {
            TicketPropertyChange change = new TicketPropertyChange();
            change.Property = property;
            change.Editor = ticketUpdated.Submitter;
            change.Changed = DateTime.Now;
            if (property == "Title")
            {
                change.OldValue = ticket.Title;
                change.NewValue = ticketUpdated.Title;
            }
            else if (property == "Description")
            {
                change.OldValue = ticket.Description;
                change.NewValue = ticketUpdated.Description;
            }
            else if (property == "Type")
            {
                change.OldValue = ticket.Type;
                change.NewValue = ticketUpdated.Type;
            }
            else if (property == "Project")
            {
                change.OldValue = ticket.Project;
                change.NewValue = ticketUpdated.Project;
            }
            else if (property == "Priority")
            {
                change.OldValue = ticket.Priority;
                change.NewValue = ticketUpdated.Priority;
            }
            else if (property == "State")
            {
                change.OldValue = ticket.State;
                change.NewValue = ticketUpdated.State;
            }
            else if (property == "Assignee")
            {
                change.OldValue = ticket.Assignee;
                change.NewValue = ticketUpdated.Assignee;
            }
            ticketUpdated.Changes.Add(change);
        }
    }
}