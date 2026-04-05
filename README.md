# ☁️ Bulut Bilişim Dersi - Belge Yönetim Sistemi Projesi

Bu proje, Bulut Bilişim dersi gereksinimleri doğrultusunda **"Çift Katmanlı Web Uygulaması" (Full-Stack)** mimarisiyle geliştirilmiş, güvenli ve yüksek erişilebilirliğe sahip bir Belge Yönetim Sistemidir (DMS). Kullanıcıların dijital dosyalarını (PDF, Word vb.) güvenle sisteme yükleyebileceği, listeleyebileceği, indirebileceği ve silebileceği uçtan uca bir çözüm sunmaktadır.

---

## 🛠️ Kullanılan Teknolojiler

Proje, modern yazılım geliştirme standartlarına uygun olarak Backend ve Frontend olmak üzere iki ana modülden oluşmaktadır.

**Backend (Sunucu ve API Katmanı)**
* **Çerçeve (Framework):** .NET Core Web API (C#)
* **Veritabanı Erişimi:** Entity Framework Core (Code-First Yaklaşımı)
* **Veritabanı:** SQL Server (Şu an LocalDB, AWS RDS'e taşınacak)
* **Güvenlik:** JWT (JSON Web Token) tabanlı kimlik doğrulama ve yetkilendirme
* **API Belgelendirme:** Swagger / OpenAPI

**Frontend (Kullanıcı Arayüzü Katmanı)**
* **Kütüphane:** React.js
* **Derleme Aracı:** Vite (Yüksek performanslı yerel sunucu ve derleme)
* **HTTP İstemcisi:** Axios (API haberleşmesi ve güvenli istek yönetimi)
* **Tasarım:** Saf CSS ile duyarlı (responsive) ve karanlık mod (dark theme) destekli modern arayüz.

---

## 🚀 Projenin Temel Özellikleri

1. **Güvenli Kimlik Doğrulama (JWT):** Sisteme sadece yetkili kullanıcılar (`admin`) giriş yapabilir. Başarılı giriş sonrası üretilen Token, tarayıcıda güvenle saklanır ve tüm işlemlerde anahtar olarak kullanılır.
2. **Belge Yükleme (Upload):** Kullanıcılar; belge başlığı, açıklaması ve fiziksel dosyayı `multipart/form-data` yapısıyla API'ye güvenle iletebilir. Arka plan, dosyaya benzersiz bir ID atayarak çakışmaları önler.
3. **Dinamik Listeleme (Read):** Yüklenen belgeler, React arayüzünde eş zamanlı olarak listelenir.
4. **Güvenli İndirme (Download):** Dosyalar statik bağlantılar üzerinden değil, JWT doğrulaması yapan özel bir API uç noktası üzerinden `Blob` formatında güvenle indirilir.
5. **Veri Silme (Delete):** Kullanıcılar, onay penceresi aracılığıyla belgeleri hem veritabanından hem de dosya sisteminden kalıcı olarak silebilir.

---

## 📂 Proje Mimarisi (Çift Katmanlı Yapı)

Proje klasörleri birbirinden tamamen bağımsız olarak çalışacak şekilde tasarlanmıştır:
* **`/BelgeYonetim`**: Arka planda çalışan, veritabanı işlemlerini yürüten ve dışarıya güvenli RESTful uç noktalar (endpoints) sunan .NET API klasörüdür.
* **`/dms-frontend`**: Kullanıcının etkileşime girdiği, API'den gelen verileri görselleştiren React arayüz klasörüdür.

---

## ⚙️ Kurulum ve Çalıştırma Talimatları (Yerel Geliştirme)

Sistemi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Backend (.NET API) Çalıştırma
1. `BelgeYonetim` klasörüne girin ve `.sln` (Çözüm) dosyasını Visual Studio ile açın.
2. Klavyeden `F5` tuşuna basarak (veya "Start Debugging" ile) projeyi başlatın.
3. Arka planda Swagger arayüzü ve API sunucusu ayağa kalkacaktır (Varsayılan adres genellikle `https://localhost:7104` şeklindedir).

### 2. Frontend (React) Çalıştırma
1. Bilgisayarınızda Node.js'in yüklü olduğundan emin olun.
2. Terminal veya Komut İstemcisi (CMD) ile `dms-frontend` klasörünün içine girin.
3. Gerekli kütüphaneleri indirmek için şu komutu çalıştırın:
   ```bash
   npm install
