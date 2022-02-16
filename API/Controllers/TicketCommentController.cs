using System.Threading.Tasks;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class TicketCommentController : BaseApiController
    {
        private readonly ITicketService _ticketService;
        private readonly ITicketCommentService _ticketCommentService;

        public TicketCommentController(ITicketService ticketService, ITicketCommentService ticketCommentService)
        {
            _ticketService = ticketService;
            _ticketCommentService = ticketCommentService;
        }
        [HttpPost("{id}/comments/create")]
        public async Task<ActionResult> AddCommentToTicket(int id, TicketComment comment)
        {
            var ticket = await _ticketService.GetTicket(id);
            ticket.Comments.Add(comment);
            _ticketService.MarkTicketAsModified(ticket);
            if (await _ticketService.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to create comment");
        }

        [HttpPost("{id}/comments/delete")]
        public async Task<ActionResult> DeleteCommentsFromTicket(int id, int[] commentIdsToDelete)
        {
            var ticket = await _ticketService.GetTicket(id);
            _ticketCommentService.DeleteCommentsFromTicket(ticket, commentIdsToDelete);
            _ticketService.MarkTicketAsModified(ticket);
            if (await _ticketService.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to delete comment(s)");
        }
    }
}