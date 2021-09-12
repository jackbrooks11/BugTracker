using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace API.Data
{
    public class UserRepository : IUserRepository
    {
        private readonly DataContext _context;
        public UserRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<AppUser> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<AppUser> GetUserByUsernameAsync(string username)
        {
            return await _context.Users
            .Include(t => t.Tickets)
            .SingleOrDefaultAsync(x => x.UserName == username);
        }


        public async Task<PagedList<AppUser>> GetUsersAsync(UserParams userParams)
        {
            var query = _context.Users
            .AsNoTracking();
            if (userParams.SearchMatch != null)
            {
                query = query.Where(u => (u.UserName.ToLower().Contains(userParams.SearchMatch.ToLower())));
            }
            query = query.OrderBy(u => u.UserName);
            return await PagedList<AppUser>.CreateAsync(query, userParams.PageNumber, userParams.PageSize);
        }
        public async Task<PagedList<AppUser>> GetUsersForProjectAsync(int id, UserParams userParams)
        {
            var users = _context.Users.Where(pu => pu.ProjectUsers.Any(u => u.ProjectId == id))
                .AsNoTracking();
            if (userParams.SearchMatch != null)
            {
                users = users.Where(u => u.UserRoles.Any(r => r.Role.Name.ToLower().Contains(userParams.SearchMatch))
                || u.UserName.ToLower().Contains(userParams.SearchMatch));
            }
            var userLength = users.Count();
            if (!userParams.Ascending)
            {
                users = users.OrderByDescending(u => u.UserName);
            }
            else
            {
                users = users.OrderBy(u => u.UserName);
            }
            users = users
                .Skip((userParams.PageNumber - 1) * userParams.PageSize)
                .Take(userParams.PageSize);
            var userList = await users
            .Select(u => new
            {
                u.Id,
                Username = u.UserName,
                Roles = u.UserRoles.Select(r => r.Role.Name).ToList()
            }).ToListAsync();
            var usersReformatted = new List<PaginatedUserDto>();
            foreach (var user in userList)
            {
                usersReformatted.Add(new PaginatedUserDto(user.Id, user.Username, user.Roles));
            }

            var usersPaginated = new PagedList<PaginatedUserDto>(usersReformatted, userLength, userParams.PageNumber, userParams.PageSize);
            
            return await PagedList<AppUser>.CreateAsync(users, userParams.PageNumber, userParams.PageSize);
        }


        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public void Update(AppUser user)
        {
            _context.Entry(user).State = EntityState.Modified;
        }
        public async void AddTicketForUserAsync(Ticket ticket)
        {
            var user = await this.GetUserByUsernameAsync(ticket.AssignedTo);
            user.Tickets.Add(ticket);
        }

    }
}