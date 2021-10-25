using System;
using System.Collections.Generic;

namespace API.Entities
{
    public class Ticket
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Project { get; set; }
        public string Description { get; set; }
        public string SubmittedBy { get; set; }
        public string AssignedTo { get; set; }
        public string Priority { get; set; }
        public string Type { get; set; } = "Bug";
        public string State { get; set; } = "Open";
         public ICollection<TicketComment> Comments { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public DateTime LastEdited { get; set; } = DateTime.Now;
    }
}