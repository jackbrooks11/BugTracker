using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class Seed
    {
        public static async Task SeedData(DataContext context) {
            await SeedUsers(context);
            await SeedTickets(context);
            await context.SaveChangesAsync();
        }
        public static async Task SeedUsers(DataContext context)
        {
            if (await context.Users.AnyAsync()) return;

            var userData = await System.IO.File.ReadAllTextAsync("Data/UserSeedData.json");
            var users = JsonSerializer.Deserialize<List<AppUser>>(userData);
            foreach(var user in users)
            {
                using var hmac = new HMACSHA512();
                user.UserName = user.UserName.ToLower();
                user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("Pa$$w0rd"));
                user.PasswordSalt = hmac.Key;

                context.Users.Add(user);
            }
        }

        public static async Task SeedTickets(DataContext context)
        {
            if (await context.Tickets.AnyAsync()) return;

            var ticketData = await System.IO.File.ReadAllTextAsync("Data/TicketSeedData.json");
            var tickets = JsonSerializer.Deserialize<List<Ticket>>(ticketData);
            foreach(var ticket in tickets)
            {
                context.Tickets.Add(ticket);
            }
        }
    }
}