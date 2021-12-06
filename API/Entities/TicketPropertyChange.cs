using System;

namespace API.Entities
{
    public class TicketPropertyChange
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public string Editor { get; set; }
        public string Property { get; set; }
        public string OldValue { get; set; }
        public string NewValue { get; set; }
        public DateTime Changed { get; set; } = DateTime.Now;
    }
}