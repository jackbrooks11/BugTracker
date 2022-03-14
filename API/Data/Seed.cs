using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class Seed
    {
        public static async Task SeedUsers(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager)
        {
            var userData = await System.IO.File.ReadAllTextAsync("Data/UserSeedData.json");

            var users = JsonSerializer.Deserialize<List<AppUser>>(userData);

            if (users == null) return;

            var roles = new List<AppRole>
            {
                new AppRole{Name = "Admin"},
                new AppRole{Name = "Project Manager"},
                new AppRole{Name = "Developer"}
            };

            foreach (var role in roles)
            {
                await roleManager.CreateAsync(role);
            }
            List<string> admins = new List<string> { "admin", "jack", "emily" };
            List<string> projectManagers = new List<string> { "ed", "heidi", "amanda", "melissa" };

            foreach (var user in users)
            {
                user.UserName = user.UserName.ToLower();
                await userManager.CreateAsync(user, "Pa$$w0rd");
                if (admins.Contains(user.UserName))
                {
                    await userManager.AddToRoleAsync(user, "Admin");
                    user.EmailConfirmed = true;
                }
                else if (projectManagers.Contains(user.UserName))
                {
                    await userManager.AddToRoleAsync(user, "Project Manager");
                }
                else
                {
                    await userManager.AddToRoleAsync(user, "Developer");
                }
                await userManager.UpdateAsync(user);
            }
        }
        public static async Task SeedProjects(DataContext context)
        {
            var projectData = await System.IO.File.ReadAllTextAsync("Data/ProjectSeedData.json");

            var projects = JsonSerializer.Deserialize<List<Project>>(projectData);
            if (projects == null) return;
            context.Projects.AddRange(projects);
            await context.SaveChangesAsync();
        }
        public static async Task SeedProjectUsers(UserManager<AppUser> userManager, DataContext context)
        {
            List<Project> projects = await context.Projects.ToListAsync();
            List<AppUser> users = await userManager.Users.ToListAsync();
            foreach (Project project in projects)
            {
                for (var i = 0; i < 6; ++i)
                {
                    ProjectUser projectUser = new ProjectUser();
                    projectUser.UserId = users[i].Id;
                    projectUser.ProjectId = project.Id;
                    projectUser.User = users[i];
                    projectUser.Project = project;
                    context.ProjectUsers.Add(projectUser);
                }
            }
            await context.SaveChangesAsync();
        }
        public static async Task SeedTickets(UserManager<AppUser> userManager, DataContext context)
        {
            var ticketData = await System.IO.File.ReadAllTextAsync("Data/TicketSeedData.json");
            var tickets = JsonSerializer.Deserialize<List<Ticket>>(ticketData);
            if (tickets == null) return;
            List<Project> projects = await context.Projects.ToListAsync();
            List<string> admins = new List<string> { "admin", "jack", "emily" };
            List<AppUser> users = await userManager.Users.Where(u => admins.Contains(u.UserName)).ToListAsync();
            Random r = new Random();
            foreach (Ticket ticket in tickets)
            {
                int userIndex = r.Next(0, 3);
                int projectIndex = r.Next(0, 13);
                ticket.Assignee = users[userIndex];
                ticket.Project = projects[projectIndex];
                if (ticket.Comments != null)
                {
                    foreach (TicketComment comment in ticket.Comments)
                    {
                        comment.Ticket = ticket;
                    }
                }
                if (ticket.Changes != null)
                {
                    foreach (TicketPropertyChange change in ticket.Changes)
                    {
                        change.Ticket = ticket;
                    }
                }
                context.Tickets.Add(ticket);
            }
            await context.SaveChangesAsync();
        }

    }
}