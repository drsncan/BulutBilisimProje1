namespace BelgeYonetim.Models
{
    // Veritabanında tutulacak ana tablo modelimiz
    public class Document
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // Dosya işlemleri için yeni eklenen alanlar
        public string FileName { get; set; } = string.Empty; // Dosyanın orijinal adı (Örn: rapor.pdf)
        public string StoredFileName { get; set; } = string.Empty; // Sunucuda karmaşıklaştırılmış adı (Örn: 1234-abcd.pdf)
        public string ContentType { get; set; } = string.Empty; // Dosyanın türü (Örn: application/pdf)

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    // Kullanıcıdan (Frontend'den) API'ye veri ve dosya alırken kullanacağımız sınıf
    public class DocumentUploadDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // IFormFile, ASP.NET Core'da fiziksel dosya almak için kullanılır
        public IFormFile? File { get; set; }
    }
}