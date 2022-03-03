using System.Collections.Generic;

namespace API.DTOs
{
    public class PaginatedUserDto
    {
        public PaginatedUserDto(int id, string username, List<string> roles, string email = null)
        {
            this.Id = id;
            this.Username = username;
            foreach(var role in roles) {
                this.Roles.Add(role);
            }
            this.Email = email;
        }

        public int Id { get; set; }

        public string Username { get; set; }
        public string Email { get; set; }

        public List<string> Roles { get; set; } = new List<string>();

        
    }
}