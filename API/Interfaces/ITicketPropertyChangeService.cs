using System.Collections.Generic;
using System.Threading.Tasks;
using API.Entities;
using API.Helpers;

namespace API.Interfaces
{
    public interface ITicketPropertyChangeService
    {
        IEnumerable<TicketPropertyChange> GetTicketPropertyChanges(int ticketId);
        Task<PagedList<TicketPropertyChange>> GetTicketPropertyChangesPaginated(TicketPropertyChangeParams propChangeParams, int ticketId);
    }
}