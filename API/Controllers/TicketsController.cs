using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class TicketsController : BaseApiController
    {
        private readonly ITicketRepository _ticketRepository;
        private readonly IMapper _mapper;
        private readonly IUserRepository _userRepository;
        private readonly IProjectRepository _projectRepository;
        public TicketsController(ITicketRepository ticketRepository, IUserRepository userRepository,
        IProjectRepository projectRepository, IMapper mapper)
        {
            _projectRepository = projectRepository;
            _userRepository = userRepository;
            _mapper = mapper;
            _ticketRepository = ticketRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTickets([FromQuery] TicketParams ticketParams)
        {
            var tickets = await _ticketRepository.GetTicketsAsync(ticketParams);

            Response.AddPaginationHeader(tickets.CurrentPage, tickets.PageSize, tickets.TotalCount, tickets.TotalPages);

            return Ok(tickets);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetTicket(int id)
        {
            return await _ticketRepository.GetTicketByIdAsync(id);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateTicket(Ticket ticketUpdated)
        {
            var project = _projectRepository.GetProjectByTitleAsync(ticketUpdated.Project).Result;
            var errorMessage = await ValidateTicket(ticketUpdated, project);
            if (errorMessage != "")
            {
                return BadRequest(errorMessage);
            }
            var id = ticketUpdated.Id;
            var ticket = await _ticketRepository.GetTicketByIdAsync(id);
            _mapper.Map(ticketUpdated, ticket);
            ticket.LastEdited = DateTime.Now;
            _projectRepository.AddTicketToProjectAsync(ticket);
            _projectRepository.Update(project);
            _ticketRepository.Update(ticket);

            if (await _ticketRepository.SaveAllAsync()) return NoContent();

            return BadRequest("Failed to update ticket");
        }

        [HttpPost("{id}/comments/create")]
        public async Task<ActionResult> AddCommentToTicket(TicketComment comment)
        {
            var ticket = await _ticketRepository.GetTicketByIdAsync(comment.TicketId);
            _ticketRepository.AddCommentToTicket(ticket, comment);
            _ticketRepository.Update(ticket);
            if (await _ticketRepository.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to create comment");
        }

        [HttpPost("create")]
        public async Task<ActionResult> CreateTicket(Ticket ticket)
        {
            var project = _projectRepository.GetProjectByTitleAsync(ticket.Project).Result;
            var errorMessage = await ValidateTicket(ticket, project);
            if (errorMessage != "")
            {
                return BadRequest(errorMessage);
            }
            if (ticket.AssignedTo.Length > 0)
            {
                _userRepository.AddTicketForUserAsync(ticket);
            }
            _projectRepository.AddTicketToProjectAsync(ticket);
            _ticketRepository.Create(ticket);

            if (await _ticketRepository.SaveAllAsync()) return NoContent();

            return BadRequest("Failed to create ticket");
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("delete")]
        public async Task<ActionResult> DeleteTickets(int[] ticketIdsToDelete)
        {
            _ticketRepository.Delete(ticketIdsToDelete);

            if (await _ticketRepository.SaveAllAsync()) return NoContent();

            return BadRequest("Failed to delete tickets");
        }

        [HttpGet("member/tickets")]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTicketsForUser([FromQuery] TicketParams ticketParams)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            var tickets = await _ticketRepository.GetTicketsForUserAsync(username, ticketParams);

            Response.AddPaginationHeader(tickets.CurrentPage, tickets.PageSize, tickets.TotalCount, tickets.TotalPages);

            return Ok(tickets);
        }

        [HttpGet("{projectTitle}/tickets")]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTicketsForProject(string projectTitle, [FromQuery] TicketForProjectParams ticketParams)
        {
            var tickets = await _ticketRepository.GetTicketsForProjectAsync(projectTitle, ticketParams);

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
            if (!await _projectRepository.ProjectExists(ticket.Project))
            {

                return "Project does not exist";
            }
            var usersForProject = await _userRepository.GetUsersForProjectAsync(project.Id, userParams);

            var assigneeCheck = usersForProject.FindAll(u => u.UserName == ticket.AssignedTo);
            if (assigneeCheck.Count == 0 && ticket.AssignedTo != "")
            {
                return "User assigned to ticket does not belong to project";
            }

            if (await _userRepository.GetUserByUsernameAsync(ticket.AssignedTo) == null && ticket.AssignedTo != "")
            {
                Response.StatusCode = 400;
                return "User assigned to ticket does not exist";
            }
            if (ticket.Title.Length == 0)
            {
                Response.StatusCode = 400;
                return "Ticket must have a title";
            }
            var ticketWithNewTitle = await _ticketRepository.GetTicketByTitleAsync(ticket.Title);
            if (await _ticketRepository.TicketExists(ticket.Title)
            && ticketWithNewTitle != null && ticketWithNewTitle.Id != ticket.Id)
            {
                Response.StatusCode = 400;
                return "Ticket already exists";
            }
            return "";
        }
    }
}