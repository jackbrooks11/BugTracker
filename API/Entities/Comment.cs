using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities
{
    public class TicketComment
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public string Message { get; set; }
        public string SubmittedBy { get; set; }
                public DateTime Created { get; set; } = DateTime.Now;
    }
}