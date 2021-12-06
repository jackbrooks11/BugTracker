using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class DataContext : IdentityDbContext<AppUser, AppRole, int, IdentityUserClaim<int>, AppUserRole,
    IdentityUserLogin<int>, IdentityRoleClaim<int>, IdentityUserToken<int>>
    {
        public DataContext(DbContextOptions options) : base(options)
        {
            
        }

        public DbSet<TicketPropertyChange> TicketPropertyChanges { get; set; }
        public DbSet<ProjectUser> ProjectUsers { get; set; }
        public DbSet<TicketComment> TicketComments { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<Project> Projects { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            
            base.OnModelCreating(builder);

            builder.Entity<AppUser>()
                .HasMany(ur => ur.UserRoles)
                .WithOne(u => u.User)
                .HasForeignKey(ur => ur.UserId)
                .IsRequired();

            builder.Entity<AppRole>()
                .HasMany(ur => ur.UserRoles)
                .WithOne(u => u.Role)
                .HasForeignKey(ur => ur.RoleId)
                .IsRequired();

            builder.Entity<Project>()
                .HasMany(pu => pu.ProjectUsers)
                .WithOne(p => p.Project)
                .HasForeignKey(pu => pu.ProjectId)
                .IsRequired();
            builder.Entity<AppUser>()
                .HasMany(pu => pu.ProjectUsers)
                .WithOne(u => u.User)
                .HasForeignKey(pu => pu.UserId)
                .IsRequired();
            builder.Entity<ProjectUser>()
                .HasKey(k => new {k.UserId, k.ProjectId});
                
        }   
    }
}