using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class ResetEmailDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Username { get; set; }
    }
}