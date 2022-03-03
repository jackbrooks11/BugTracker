using System.Threading.Tasks;
using API.Entities;

namespace API.Interfaces
{
    public interface IEmailService
    {
        Task<Mail> CreateEmail(string clientURI, string email, AppUser user);
        bool SendEmail(Mail mail);
    }
}