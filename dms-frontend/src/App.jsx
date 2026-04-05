import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  // --- 1. GÜVENLİK (LOGIN) STATE'LERİ ---
  // Sayfa açıldığında tarayıcı hafızasında token var mı diye kontrol ediyoruz
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // --- 2. BELGE STATE'LERİ ---
  const [documents, setDocuments] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)

  // Eğer token varsa (kullanıcı giriş yapmışsa) belgeleri otomatik çek
  useEffect(() => {
    if (token) {
      fetchDocuments();
    }
  }, [token])

  // --- 3. GİRİŞ YAPMA (LOGIN) VE ÇIKIŞ YAPMA FONKSİYONLARI ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Backend'deki Auth/login adresimize istek atıyoruz
      const response = await axios.post('https://localhost:7104/api/Auth/login', {
        username: username,
        password: password
      });
      
      const alinanToken = response.data.token;
      setToken(alinanToken); // Token'ı React hafızasına al
      localStorage.setItem('token', alinanToken); // Token'ı tarayıcı hafızasına al
      
    } catch (error) {
      console.error("Giriş hatası:", error);
      alert("Kullanıcı adı veya şifre hatalı!");
    }
  }

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setDocuments([]); // Çıkış yapınca ekrandaki belgeleri temizle
  }

  // --- 4. GÜVENLİ İSTEKLER İÇİN YARDIMCI FONKSİYON ---
  // Tüm isteklerin başlığına (header) bu dijital anahtarı ekleyeceğiz
  const getAuthHeaders = () => {
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  }

  // --- 5. CRUD İŞLEMLERİ (TOKEN EKLENMİŞ HALİ) ---
  const fetchDocuments = async () => {
    try {
      // getAuthHeaders() ile anahtarı API'ye gönderiyoruz
      const response = await axios.get('https://localhost:7104/api/Documents', getAuthHeaders());
      setDocuments(response.data);
    } catch (error) {
      console.error("Belgeler çekilirken hata:", error);
      if(error.response && error.response.status === 401) {
         handleLogout();
         alert("Oturum süreniz doldu, lütfen tekrar giriş yapın.");
      }
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Lütfen bir dosya seçin!"); return;
    }

    const formData = new FormData();
    formData.append("Title", title);
    formData.append("Description", description);
    formData.append("File", file);

    try {
      await axios.post('https://localhost:7104/api/Documents', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // Yüklerken de anahtarı gönder
        }
      });
      
      alert("Belge başarıyla yüklendi!");
      setTitle(''); setDescription(''); setFile(null);
      document.getElementById('fileInput').value = '';
      fetchDocuments();
    } catch (error) {
      console.error("Yükleme hatası:", error);
      alert("Dosya yüklenirken hata oluştu.");
    }
  }

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Bu belgeyi silmek istediğinize emin misiniz?");
    if (isConfirmed) {
      try {
        await axios.delete(`https://localhost:7104/api/Documents/${id}`, getAuthHeaders());
        alert("Belge başarıyla silindi!");
        fetchDocuments();
      } catch (error) {
        console.error("Silme hatası:", error);
        alert("Belge silinirken yetki hatası oluştu.");
      }
    }
  }

  // GÜVENLİ İNDİRME FONKSİYONU
  const handleDownload = async (id, fileName) => {
    try {
       const response = await axios.get(`https://localhost:7104/api/Documents/download/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob' // Gelen verinin bir dosya (blob) olduğunu belirtiyoruz
       });
       
       // Dosyayı tarayıcıya indirtmek için geçici bir link oluşturup tıklatıyoruz
       const url = window.URL.createObjectURL(new Blob([response.data]));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download', fileName); 
       document.body.appendChild(link);
       link.click();
       link.remove();
    } catch (error) {
        console.error("İndirme hatası:", error);
        alert("Dosya indirilirken yetki hatası oluştu.");
    }
 }

  // --- EKRAN TASARIMLARI ---

  // DURUM 1: EĞER KULLANICI GİRİŞ YAPMAMIŞSA SADECE GİRİŞ EKRANINI GÖSTER
  if (!token) {
    return (
      <div className="container" style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', backgroundColor: '#2a2a2a', borderRadius: '8px', textAlign: 'center' }}>
        <h2>Sisteme Giriş Yapın</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <input 
            type="text" 
            placeholder="Kullanıcı Adı (Örn: admin)" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '4px' }}
          />
          <input 
            type="password" 
            placeholder="Şifre (Örn: 12345)" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '4px' }}
          />
          <button type="submit" style={{ padding: '12px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            GİRİŞ YAP
          </button>
        </form>
      </div>
    )
  }

  // DURUM 2: GİRİŞ BAŞARILIYSA ANA SİSTEMİ GÖSTER
  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Belge Yönetim Sistemi</h1>
        <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Çıkış Yap
        </button>
      </div>
      
      {/* BELGE YÜKLEME FORMU */}
      <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '8px', marginBottom: '30px', marginTop: '20px' }}>
        <h2>Yeni Belge Yükle</h2>
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" placeholder="Belge Başlığı" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: '10px', borderRadius: '4px' }}/>
          <input type="text" placeholder="Belge Açıklaması" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ padding: '10px', borderRadius: '4px' }}/>
          <input id="fileInput" type="file" onChange={(e) => setFile(e.target.files[0])} required style={{ padding: '10px' }}/>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            YÜKLE
          </button>
        </form>
      </div>

      {/* BELGE LİSTESİ */}
      <div className="document-list">
        <h2>Sistemdeki Belgeler</h2>
        {documents.length === 0 ? (
          <p>Henüz sistemde belge bulunmuyor.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {documents.map((doc) => (
              <li key={doc.id} style={{ backgroundColor: '#1e1e1e', border: '1px solid #444', margin: '10px 0', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#61dafb' }}>{doc.title}</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{doc.description}</p>
                  <small style={{ color: '#aaa' }}>Orijinal Dosya: {doc.fileName}</small>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {/* Yeni güvenli indirme butonu */}
                  <button onClick={() => handleDownload(doc.id, doc.fileName)} style={{ padding: '8px 15px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    İndir
                  </button>
                  <button onClick={() => handleDelete(doc.id)} style={{ padding: '8px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App