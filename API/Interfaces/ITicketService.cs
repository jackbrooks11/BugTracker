using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces
{
    public interface ITicketService
    {
        Task<Ticket> GetTicket(int id);
        Task<TicketDto> GetTicketAsDto(int id);
        IEnumerable<TicketDto> GetTicketsAsDtos();
        Task<PagedList<TicketDto>> GetTicketsPaginated(TicketParams ticketParams);
        Task<PagedList<TicketDto>> GetTicketsForUser(TicketParams ticketParams, string username);
        Task<PagedList<TicketDto>> GetTicketsForProject(TicketParams ticketParams, string projectTitle);
        void DeleteTickets(int[] ticketIdsToDelete);
        Task<string> ValidateTicket(TicketDto ticketDto, Project project);
        TicketDto AddChangesToTicket(TicketDto existingTicketDto, TicketDto newTicketDto, string editor);
        TicketDto AddChangeToTicket(TicketDto existingTicketDto, TicketDto newTicketDto, string property, string editor);
        void AddTicket(Ticket ticket);
        void MarkTicketAsModified(Ticket ticket);
        Ticket MapTicket(TicketDto ticketDto, Ticket ticket);
        Task<bool> SaveAllAsync();
    }
}