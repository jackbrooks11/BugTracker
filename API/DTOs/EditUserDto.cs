namespace API.DTOs
{
    public class EditUserDto
    {
        public string About { get; set; }
        public string FullName { get; set; }
        public string Password { get; set; }
        public string NewPassword { get; set; }
    }
}