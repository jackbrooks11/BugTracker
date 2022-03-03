using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;

namespace API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly EmailConfiguration _emailConfig;
        private readonly UserManager<AppUser> _userManager;
        public EmailService(IConfiguration config, EmailConfiguration emailConfig,
        UserManager<AppUser> userManager)
        {
            _config = config;
            _emailConfig = emailConfig;
            _userManager = userManager;
        }
        public async Task<Mail> CreateEmail(string clientURI, string email, AppUser user)
        {
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var param = new Dictionary<string, string>
            {
                {"token", token },
                {"email", email }
            };
            var callback = QueryHelpers.AddQueryString(clientURI, param);
            var mail = new Mail
            {
                To = email,
                Link = callback,
                Subject = "Email Confirmation"
            };
            return mail;
        }
        public bool SendEmail(Mail mail)
        {
            MailMessage mailMessage = new MailMessage();
            mailMessage.From = new MailAddress(_emailConfig.From);
            mailMessage.To.Add(new MailAddress(mail.To));
            mailMessage.Subject = mail.Subject;
            mailMessage.IsBodyHtml = true;
            mailMessage.Body = mail.Link;

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