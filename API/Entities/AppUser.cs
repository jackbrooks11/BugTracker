using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace API.Entities
{
    public class AppUser : IdentityUser<int>
    {
        public string FullName { get; set; }
        public string Company { get; set; }
        public string About { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public DateTime LastActive { get; set; } = DateTime.Now;
        public ICollection<Ticket> Tickets { get; set; }
        public ICollection<AppUserRole> UserRoles { get; set; }
        public ICollection<ProjectUser> ProjectUsers { get; set; }

    }
}