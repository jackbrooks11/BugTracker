using System.Collections.Generic;
using System.Threading.Tasks;
using API.Entities;
using API.Helpers;

namespace API.Interfaces
{
    public interface ITicketRepository
    {
        void Update(Ticket user);
        Task<bool> SaveAllAsync();
        Task<PagedList<Ticket>> GetTicketsAsync(TicketParams ticketParams);
        Task<Ticket> GetTicketByIdAsync(int id);   
    }
}