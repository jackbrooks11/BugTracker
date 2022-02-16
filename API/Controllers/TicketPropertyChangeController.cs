using System.Collections.Generic;
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
    public class TicketPropertyChangeController : BaseApiController
    {
        private readonly ITicketPropertyChangeService _ticketPropertyChangeService;

        public TicketPropertyChangeController(ITicketPropertyChangeService ticketPropertyChangeService)
        {
            _ticketPropertyChangeService = ticketPropertyChangeService;
        }
        
        [HttpGet("{ticketId}")]
        public IEnumerable<TicketPropertyChange> GetTicketPropertyChanges(int ticketId) {
            return _ticketPropertyChangeService.GetTicketPropertyChanges(ticketId);
        }

        [HttpGet("paginated/{ticketId}")]
        public async Task<ActionResult<IEnumerable<TicketPropertyChange>>> GetTicketPropertyChangesPaginated([FromQuery] TicketPropertyChangeParams propChangeParams, int ticketId)
        {
            var propChanges = await _ticketPropertyChangeService.GetTicketPropertyChangesPaginated(propChangeParams, ticketId);

            Response.AddPaginationHeader(propChanges.CurrentPage, propChanges.PageSize, propChanges.TotalCount, propChanges.TotalPages);

            return Ok(propChanges);
        }
    }
}