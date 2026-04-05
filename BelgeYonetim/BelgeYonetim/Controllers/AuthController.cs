using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BelgeYonetim.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        // Ayarları (appsettings.json) okuyabilmek için constructor tanımlıyoruz
        public AuthController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // Kullanıcıdan gelecek verilerin modeli
        public class LoginModel
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel login)
        {
            // Sisteme sadece bu bilgilerle girilmesine izin veriyoruz
            if (login.Username == "admin" && login.Password == "12345")
            {
                // appsettings.json içindeki gizli kelimemizi alıyoruz
                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
                var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

                // Kullanıcıya ait temel bilgileri (Claims) hazırlıyoruz
                var claims = new[] {
                    new Claim(JwtRegisteredClaimNames.Sub, login.Username),
                    new Claim("Role", "Admin")
                };

                // Dijital anahtarımızı (Token) üretiyoruz
                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    claims: claims,
                    expires: DateTime.Now.AddHours(2), // Anahtarın geçerlilik süresi 2 saat
                    signingCredentials: credentials);

                // Token'ı React'a gönderiyoruz
                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token)
                });
            }

            // Bilgiler uyuşmazsa hata döndürüyoruz
            return Unauthorized("Kullanıcı adı veya şifre hatalı!");
        }
    }
}