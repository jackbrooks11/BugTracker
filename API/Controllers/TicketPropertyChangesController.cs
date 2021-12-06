using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using API.Extensions;
using API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    public class TicketPropertyChangesController : BaseApiController
    {
        private readonly DataContext _context;

        public TicketPropertyChangesController(DataContext context)
        {
            _context = context;
        }
        
        [HttpGet("{ticketId}")]
        public IEnumerable<TicketPropertyChange> GetTicketPropertyChanges(int ticketId) {
            var changes = _context.TicketPropertyChanges.Where(c => c.TicketId == ticketId).AsNoTracking();
            return changes;
        }

        [HttpGet("paginated/{ticketId}")]
        public async Task<ActionResult<IEnumerable<TicketPropertyChange>>> GetTicketPropertyChangesPaginated(int ticketId, [FromQuery] TicketPropertyChangeParams propChangeParams)
        {
            var query = _context.TicketPropertyChanges.Where(c => c.TicketId == ticketId).AsNoTracking();
            if (propChangeParams.SearchMatch != null)
            {
                query = query.Where(c => (c.Editor.ToLower().Contains(propChangeParams.SearchMatch.ToLower()) ||
                c.Property.ToLower().Contains(propChangeParams.SearchMatch.ToLower()) ||
                c.OldValue.ToLower().Contains(propChangeParams.SearchMatch.ToLower()) ||
                c.NewValue.ToLower().Contains(propChangeParams.SearchMatch.ToLower())));
            }
            if (!propChangeParams.Ascending)
            {
                query = propChangeParams.OrderBy switch
                {
                    "editor" => query.OrderByDescending(c => c.Editor),
                    "property" => query.OrderByDescending(c => c.Property),
                    "oldValue" => query.OrderByDescending(c => c.OldValue),
                    "newValue" => query.OrderByDescending(c => c.NewValue),
                    _ => query.OrderByDescending(c => c.Changed)
                };
            }
            else
            {
                query = propChangeParams.OrderBy switch
                {
                    "editor" => query.OrderBy(c => c.Editor),
                    "property" => query.OrderBy(c => c.Property),
                    "oldValue" => query.OrderBy(c => c.OldValue),
                    "newValue" => query.OrderBy(c => c.NewValue),
                    _ => query.OrderBy(c => c.Changed)
                };
            }

            var propChanges = await PagedList<TicketPropertyChange>.CreateAsync(query, propChangeParams.PageNumber, propChangeParams.PageSize);

            Response.AddPaginationHeader(propChanges.CurrentPage, propChanges.PageSize, propChanges.TotalCount, propChanges.TotalPages);

            return Ok(propChanges);
        }
    }
}