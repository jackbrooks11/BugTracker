using System;
using System.Collections.Generic;
using API.Entities;

namespace API.DTOs
{
    public class TicketDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Project { get; set; }
        public string Description { get; set; }
        public string Submitter { get; set; }
        public string Assignee { get; set; }
        public string Priority { get; set; } = "Medium";
        public string Type { get; set; } = "Bug";
        public string State { get; set; } = "Open";
        public ICollection<TicketComment> Comments { get; set; }
        public ICollection<TicketPropertyChange> Changes { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public DateTime LastEdited { get; set; } = DateTime.Now;
    }
}