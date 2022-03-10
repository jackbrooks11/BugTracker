using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace API.Services
{
    public class TicketPropertyChangeService : ITicketPropertyChangeService
    {
        private readonly DataContext _context;
        public TicketPropertyChangeService(IConfiguration config, DataContext context)
        {
            _context = context;
        }

        public IEnumerable<TicketPropertyChange> GetTicketPropertyChanges(int ticketId)
        {
            return _context.TicketPropertyChanges.Where(c => c.TicketId == ticketId).AsNoTracking();
        }

        public async Task<PagedList<TicketPropertyChange>> GetTicketPropertyChangesPaginated(TicketPropertyChangeParams propChangeParams, int ticketId)
        {
            var query = GetQuery(propChangeParams, ticketId);
            return await PagedList<TicketPropertyChange>.CreateAsync(query, propChangeParams.PageNumber, propChangeParams.PageSize);
        }
        private IQueryable<TicketPropertyChange> GetQuery(TicketPropertyChangeParams propChangeParams, int ticketId) {
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
                    "editor" => query.OrderByDescending(c => c.Editor.ToLower()),
                    "property" => query.OrderByDescending(c => c.Property.ToLower()),
                    "oldValue" => query.OrderByDescending(c => c.OldValue.ToLower()),
                    "newValue" => query.OrderByDescending(c => c.NewValue.ToLower()),
                    _ => query.OrderByDescending(c => c.Changed)
                };
            }
            else
            {
                query = propChangeParams.OrderBy switch
                {
                    "editor" => query.OrderBy(c => c.Editor.ToLower()),
                    "property" => query.OrderBy(c => c.Property.ToLower()),
                    "oldValue" => query.OrderBy(c => c.OldValue.ToLower()),
                    "newValue" => query.OrderBy(c => c.NewValue.ToLower()),
                    _ => query.OrderBy(c => c.Changed)
                };
            }
            return query;
        }
    }
}    