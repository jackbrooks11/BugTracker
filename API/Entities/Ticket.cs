using System;

namespace API.Entities
{
    public class Ticket
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string SubmittedByUserName { get; set; }
        public string AssignedToUserName { get; set; }
        public string Priority { get; set; }
        public string Type { get; set; }
        public string State { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public DateTime LastEdited { get; set; } = DateTime.Now;
    }
}