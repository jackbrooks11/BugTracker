using API.Entities;

namespace API.Interfaces
{
    public interface ITicketCommentService
    {
        void DeleteCommentsFromTicket(Ticket ticket, int[] commentIdsToDelete);
    }
}