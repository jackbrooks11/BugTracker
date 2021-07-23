using System.Collections.Generic;
using System.Threading.Tasks;
using API.Entities;
using API.Helpers;

namespace API.Interfaces
{
    public interface ITicketRepository
    {
        void Update(Ticket ticket);
        Task<bool> SaveAllAsync();
        Task<PagedList<Ticket>> GetTicketsAsync(TicketParams ticketParams);
        Task<Ticket> GetTicketByIdAsync(int id);   
        void Create(Ticket ticket);
        Task<bool> TicketExists(string title);

        void Delete(int[] ticketIdsToDelete);
    }
}