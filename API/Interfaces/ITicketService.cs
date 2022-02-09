using System.Collections.Generic;
using System.Threading.Tasks;
using API.Entities;
using API.Helpers;

namespace API.Interfaces
{
    public interface ITicketService
    {
        Task<Ticket> GetTicket(int id);
        IEnumerable<Ticket> GetTickets();
        Task<PagedList<Ticket>> GetTicketsPaginated(TicketParams ticketParams);
        Task<PagedList<Ticket>> GetTicketsForUser(TicketParams ticketParams, string username);
        Task<PagedList<Ticket>> GetTicketsForProject(TicketParams ticketParams, string projectTitle);
        void DeleteTickets(int[] ticketIdsToDelete);
        Task<string> ValidateTicket(Ticket ticket, Project project);
        void AddChangesToTicket(Ticket ticket, Ticket newTicket);
        void AddChangeToTicket(Ticket ticket, Ticket newTicket, string property);
        void MarkTicketAsModified(Ticket ticket);
        Task<bool> SaveAllAsync();
    }
}