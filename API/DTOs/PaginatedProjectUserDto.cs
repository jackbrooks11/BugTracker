using System.Collections.Generic;

namespace API.DTOs
{
    public class PaginatedProjectUserDto
    {
        public PaginatedProjectUserDto(int id, string username, List<string> roles)
        {
            this.Id = id;
            this.Username = username;
            foreach (var role in roles)
            {
                this.Roles.Add(role);
            }
        }
        public int Id { get; set; }
        public string Username { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
        
    }
}