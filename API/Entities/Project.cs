using System;
using System.Collections.Generic;

namespace API.Entities
{
    public class Project
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public ICollection<Ticket> Tickets { get; set; }
        public ICollection<ProjectUser> ProjectUsers { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public DateTime LastEdited { get; set; } = DateTime.Now;
    }
}