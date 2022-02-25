using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using API.DTOs;
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
        public async Task<ActionResult<TicketDto>> GetTicket(int id)
        {
            return await _ticketService.GetTicketAsDto(id);
        }

        [HttpGet]
         public IEnumerable<TicketDto> GetTickets()
        {
            return _ticketService.GetTicketsAsDtos();
        }

        [HttpGet("paginated")]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetTicketsPaginated([FromQuery] TicketParams ticketParams)
        {
            var tickets = await _ticketService.GetTicketsPaginated(ticketParams);

            Response.AddPaginationHeader(tickets.CurrentPage, tickets.PageSize, tickets.TotalCount, tickets.TotalPages);

            return Ok(tickets);
        }

        [HttpGet("user/tickets")]
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
        public async Task<ActionResult> UpdateTicket(TicketDto newTicketDto)
        {
            var project = await _projectService.GetProject(newTicketDto.Project);
            var errorMessage = await _ticketService.ValidateTicket(newTicketDto, project);
            if (errorMessage != "")
            {
                return BadRequest(errorMessage);
            }
            var existingTicketDto = await _ticketService.GetTicketAsDto(newTicketDto.Id);
            existingTicketDto = _ticketService.AddChangesToTicket(existingTicketDto, newTicketDto);
            var existingTicket = await _ticketService.GetTicket(existingTicketDto.Id);
            existingTicket = await GenerateTicket(existingTicketDto, existingTicket);
            _ticketService.MarkTicketAsModified(existingTicket);
            if (await _ticketService.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to update ticket");
        }

        [HttpPost("create")]
        public async Task<ActionResult> CreateTicket(TicketDto ticketDto)
        {
            var ticket = new Ticket();
            ticket = await GenerateTicket(ticketDto, ticket);
            _ticketService.AddTicket(ticket);
            if (await _ticketService.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to create ticket");
        }

        private async Task<Ticket> GenerateTicket(TicketDto ticketDto, Ticket ticket) {
            ticket = _ticketService.MapTicket(ticketDto, ticket);
            ticket.Assignee = await _userService.GetUserByUsernameAsync(ticketDto.Assignee);
            ticket.Project = await _projectService.GetProject(ticketDto.Project);
            return ticket;
        }

    }
}