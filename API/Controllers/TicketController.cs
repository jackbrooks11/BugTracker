using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class TicketController : BaseApiController
    {
        private readonly ITicketService _ticketService;
        private readonly IProjectService _projectService;
        private readonly IUserService _userService;
        public TicketController(ITicketService ticketService, IProjectService projectService, IUserService userService)
        {
            _ticketService = ticketService;
            _projectService = projectService;
            _userService = userService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetTicket(int id)
        {
            return await _ticketService.GetTicket(id);
        }

        [HttpGet]
         public IEnumerable<Ticket> GetTickets()
        {
            return _ticketService.GetTickets();
        }

        [HttpGet("paginated")]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTicketsPaginated([FromQuery] TicketParams ticketParams)
        {
            var tickets = await _ticketService.GetTicketsPaginated(ticketParams);

            Response.AddPaginationHeader(tickets.CurrentPage, tickets.PageSize, tickets.TotalCount, tickets.TotalPages);

            return Ok(tickets);
        }

        [HttpGet("member/tickets")]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTicketsForUser([FromQuery] TicketParams ticketParams)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var tickets = await _ticketService.GetTicketsForUser(ticketParams, username);

            Response.AddPaginationHeader(tickets.CurrentPage, tickets.PageSize, tickets.TotalCount, tickets.TotalPages);

            return Ok(tickets);
        }

        [HttpGet("{projectTitle}/tickets")]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTicketsForProject([FromQuery] TicketParams ticketParams, string projectTitle)
        {
            var tickets = await _ticketService.GetTicketsForProject(ticketParams, projectTitle);

            Response.AddPaginationHeader(tickets.CurrentPage, tickets.PageSize, tickets.TotalCount, tickets.TotalPages);

            return Ok(tickets);
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("delete")]
        public async Task<ActionResult> DeleteTickets(int[] ticketIdsToDelete)
        {
            _ticketService.DeleteTickets(ticketIdsToDelete);

            if (await _ticketService.SaveAllAsync()) return NoContent();

            return BadRequest("Failed to delete ticket(s)");
        }

        [HttpPut]
        public async Task<ActionResult> UpdateTicket(Ticket newTicket)
        {
            var project = await _projectService.GetProject(newTicket.Project);
            var errorMessage = await _ticketService.ValidateTicket(newTicket, project);
            if (errorMessage != "")
            {
                return BadRequest(errorMessage);
            }
            var ticket = await _ticketService.GetTicket(newTicket.Id);
            _ticketService.AddChangesToTicket(ticket, newTicket);
            project.Tickets.Add(ticket);
            if (await _ticketService.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to update ticket");
        }

        [HttpPost("create")]
        public async Task<ActionResult> CreateTicket(Ticket ticket)
        {
            var project = await _projectService.GetProject(ticket.Project);
            if (ticket.Assignee.Length > 0)
            {
                var user = await _userService.GetUserByUsernameAsync(ticket.Assignee);
                user.Tickets.Add(ticket);
            }
            project.Tickets.Add(ticket);
            if (await _ticketService.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to create ticket");
        }
    }
}