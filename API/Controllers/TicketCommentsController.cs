using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    public class TicketCommentsController : BaseApiController
    {
        private readonly DataContext _context;

        public TicketCommentsController(DataContext context)
        {
            _context = context;
        }
        [HttpPost("{id}/comments/create")]
        public async Task<ActionResult> AddCommentToTicket(int id, TicketComment comment)
        {
            var ticket = await _context.Tickets.Include(x => x.Comments).FirstOrDefaultAsync(y => y.Id == id);
            ticket.Comments.Add(comment);
            _context.Entry(ticket).State = EntityState.Modified;
            if (await _context.SaveChangesAsync() > 0) return NoContent();
            return BadRequest("Failed to create comment");
        }

        [HttpPost("{id}/comments/delete")]
        public async Task<ActionResult> DeleteCommentsFromTicket(int id, int[] commentIdsToDelete)
        {
            var ticket = await _context.Tickets.Include(x => x.Comments).FirstOrDefaultAsync(y => y.Id == id);
            var commentsToDelete = ticket.Comments.Where(c => commentIdsToDelete.Contains(c.Id));
            foreach (var comment in commentsToDelete)
            {
                _context.Remove(comment);
            }
            _context.Entry(ticket).State = EntityState.Modified;
            if (await _context.SaveChangesAsync() > 0) return NoContent();
            return BadRequest("Failed to delete comment(s)");
        }
    }
}