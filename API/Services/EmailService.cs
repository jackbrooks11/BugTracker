using System;
using System.Net;
using System.Net.Mail;
using API.Entities;
using API.Interfaces;
using Microsoft.Extensions.Configuration;

namespace API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly EmailConfiguration _emailConfig;

        public EmailService(IConfiguration config, EmailConfiguration emailConfig)
        {
            _config = config;
            _emailConfig = emailConfig;
        }
        public bool SendEmail(string email, string link)
        {
            MailMessage mailMessage = new MailMessage();
            mailMessage.From = new MailAddress(_emailConfig.From);
            mailMessage.To.Add(new MailAddress(email));
            mailMessage.Subject = "Password Reset";
            mailMessage.IsBodyHtml = true;
            mailMessage.Body = link;

            SmtpClient client = new SmtpClient();
            client.EnableSsl = true;
            client.UseDefaultCredentials = false;
            client.Credentials = new NetworkCredential(_emailConfig.From, _emailConfig.Password);
            client.Host = _emailConfig.SmtpServer;
            client.Port = _emailConfig.Port;
            client.DeliveryMethod = SmtpDeliveryMethod.Network;

            try
            {
                client.Send(mailMessage);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}