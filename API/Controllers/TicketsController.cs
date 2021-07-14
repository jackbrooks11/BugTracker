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
        public TicketsController(ITicketRepository ticketRepository, IUserRepository userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _ticketRepository = ticketRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTickets([FromQuery]TicketParams ticketParams)
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
            var id = ticketUpdated.Id;
            var ticket = await _ticketRepository.GetTicketByIdAsync(id);
            _mapper.Map(ticketUpdated, ticket);
            _ticketRepository.Update(ticket);


            if (await _ticketRepository.SaveAllAsync()) return NoContent();

            return BadRequest("Failed to update ticket");
        }


    }
}