using BelgeYonetim.Data;
using BelgeYonetim.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BasitDmsApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        // IWebHostEnvironment, sunucudaki klasör yollarını bulmamızı sağlar (wwwroot gibi)
        public DocumentsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/documents
        [HttpGet]
        public async Task<IActionResult> GetDocuments()
        {
            var documents = await _context.Documents.ToListAsync();
            return Ok(documents);
        }

        // POST: api/documents
        // JSON yerine "FromForm" kullanıyoruz çünkü işin içinde fiziksel bir dosya var
        [HttpPost]
        public async Task<IActionResult> UploadDocument([FromForm] DocumentUploadDto dto)
        {
            if (dto.File == null || dto.File.Length == 0)
            {
                return BadRequest("Lütfen geçerli bir dosya yükleyin.");
            }

            // Dosyaların kaydedileceği klasör yolunu belirliyoruz (wwwroot/uploads)
            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");

            // Klasör yoksa oluşturuyoruz
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Aynı isimdeki dosyaların çakışmasını önlemek için benzersiz bir isim üretiyoruz
            var fileExtension = Path.GetExtension(dto.File.FileName);
            var storedFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, storedFileName);

            // Dosyayı sunucuya kopyalıyoruz
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            // Veritabanı modelimizi oluşturuyoruz
            var document = new Document
            {
                Title = dto.Title,
                Description = dto.Description,
                FileName = dto.File.FileName,
                StoredFileName = storedFileName,
                ContentType = dto.File.ContentType,
                CreatedAt = DateTime.Now
            };

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            return Ok(document);
        }

        // GET: api/documents/download/5
        // Dosyayı indirmek için özel bir uç nokta
        [HttpGet("download/{id}")]
        public async Task<IActionResult> DownloadDocument(int id)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document == null) return NotFound("Belge bulunamadı.");

            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            var filePath = Path.Combine(uploadsFolder, document.StoredFileName);

            if (!System.IO.File.Exists(filePath)) return NotFound("Fiziksel dosya sunucuda bulunamadı.");

            var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
            return File(stream, document.ContentType, document.FileName);
        }

        // DELETE: api/documents/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document == null) return NotFound();

            // Veritabanından silmeden önce sunucudaki fiziksel dosyayı da siliyoruz
            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            var filePath = Path.Combine(uploadsFolder, document.StoredFileName);

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}