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
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTickets([FromQuery] TicketParams ticketParams)
        {
            var query = _context.Tickets
                .Include(t => t.Comments)
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
            return await _context.Tickets.Include(x => x.Comments).FirstOrDefaultAsync(y => y.Id == id);
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
            _mapper.Map(ticketUpdated, ticket);
            ticket.LastEdited = DateTime.Now;
            project.Tickets.Add(ticket);
            _context.Entry(project).State = EntityState.Modified;
            _context.Entry(ticket).State = EntityState.Modified;

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
            if (!await _context.Projects.AnyAsync(x => x.Title.ToLower() == ticket.Project.ToLower()))
            {

                return "Project does not exist";
            }

            /*Get Users for Project*/
            
            var assigneeCheck = await _context.ProjectUsers.AnyAsync(pu => pu.ProjectId == project.Id && pu.User.UserName.ToLower() == ticket.Assignee.ToLower());

            if (!assigneeCheck && ticket.Assignee != "")
            {
                return "User assigned to ticket does not belong to project";
            }

            if (await _context.Users
            .Include(t => t.Tickets)
            .SingleOrDefaultAsync(x => x.UserName == ticket.Assignee) == null && ticket.Assignee != "")
            {
                Response.StatusCode = 400;
                return "User assigned to ticket does not exist";
            }
            if (ticket.Title.Length == 0)
            {
                Response.StatusCode = 400;
                return "Ticket must have a title";
            }
            var ticketWithNewTitle = await _context.Tickets
              .SingleOrDefaultAsync(x => x.Title == ticket.Title);
            if (await _context.Tickets.AnyAsync(x => x.Title.ToLower() == ticket.Title.ToLower())
            && ticketWithNewTitle != null && ticketWithNewTitle.Id != ticket.Id)
            {
                Response.StatusCode = 400;
                return "Ticket already exists";
            }
            return "";
        }
    }
}