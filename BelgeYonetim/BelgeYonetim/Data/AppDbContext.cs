using BelgeYonetim.Models;
using Microsoft.EntityFrameworkCore;

namespace BelgeYonetim.Data 
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Document> Documents { get; set; }
    }
}