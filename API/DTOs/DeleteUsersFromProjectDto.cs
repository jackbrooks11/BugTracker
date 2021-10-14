using API.Entities;

namespace API.DTOs
{
    public class DeleteUsersFromProjectDto
    {
        public Project Project { get; set; }
        public string[] UsernamesToDelete { get; set; }
    }
}