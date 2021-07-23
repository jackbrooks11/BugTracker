using System.Collections.Generic;
using System.Threading.Tasks;
using API.Entities;
using API.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace API.Interfaces
{
    public interface IUserRepository
    {
        void Update(AppUser user);

        void AddTicketForUserAsync(Ticket ticket);
        Task<bool> SaveAllAsync();
        Task<PagedList<AppUser>> GetUsersAsync(UserParams userParams);
        Task<AppUser> GetUserByIdAsync(int id);
        Task<AppUser> GetUserByUsernameAsync(string username);
        Task<PagedList<Ticket>> GetTicketsForUserAsync(string username, TicketParams ticketParams);
    }
}