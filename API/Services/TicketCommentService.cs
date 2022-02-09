using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.Extensions.Configuration;

namespace API.Services
{
    public class TicketCommentService : ITicketCommentService
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public TicketCommentService(IConfiguration config, IMapper mapper, DataContext context)
        {
            _context = context;
            _mapper = mapper;
        }

        public void DeleteCommentsFromTicket(Ticket ticket, int[] commentIdsToDelete)
        {
            var commentsToDelete = GetCommentsToDelete(ticket, commentIdsToDelete);
            foreach (var comment in commentsToDelete)
            {
                _context.Remove(comment);
            }
        }

        private IEnumerable<TicketComment> GetCommentsToDelete(Ticket ticket, int[] commentIdsToDelete)
        {
            return  ticket.Comments.Where(c => commentIdsToDelete.Contains(c.Id));
        }
    }
}