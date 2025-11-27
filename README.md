
# RotamUni - Çalışma Takip Asistanı

YKS sınavına hazırlanan öğrenciler için kapsamlı bir çalışma takip uygulaması. To-do list, soru sayacı, çalışma zamanlayıcısı ve detaylı analiz grafikleri ile çalışmalarınızı verimli bir şekilde yönetin.

RotamUni(./attached_assets/logo.png)

## Özellikler

### To-Do List (Yapılacaklar Listesi)
- Çalışma görevlerinizi organize edin
- Tamamlanan görevleri takip edin
- Kolay ekleme ve silme işlemleri

### Soru Sayacı
- Çözdüğünüz soruları ders bazında kaydedin
- Günlük soru hedeflerinizi takip edin
- Ders başına ilerlemenizi görün

### Çalışma Zamanlayıcısı
- **Kronometre Modu**: Serbest çalışma sürenizi ölçün
- **Pomodoro Modu**: 25 dakika çalışma, 5 dakika mola tekniği
- Çalışma seanslarınızı otomatik kaydedin

### Analiz ve İstatistikler
- Haftalık ve aylık çalışma süreniz
- Ders bazında soru çözüm istatistikleri
- Görsel grafikler ile ilerleme takibi
- TYT/AYT net takibi ve gelişim grafikleri

### Streak Takibi
- Ardışık çalışma günlerinizi takip edin
- Aylık çalışma takvimi
- Motivasyonunuzu yüksek tutun

### Net Takibi
- TYT ve AYT deneme sınavı sonuçlarınızı kaydedin
- Ders bazında net hesaplaması
- Zaman içinde gelişiminizi görselleştirin

## Teknolojiler

### Frontend
- **React** + **TypeScript** - Modern ve tip güvenli kullanıcı arayüzü
- **Vite** - Hızlı geliştirme ortamı
- **Wouter** - Hafif client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Radix UI tabanlı component kütüphanesi
- **Recharts** - Veri görselleştirme
- **TanStack Query** - Server state yönetimi
- **React Hook Form** + **Zod** - Form validasyonu

### Backend
- **Node.js** + **Express.js** - RESTful API
- **PostgreSQL** - Veritabanı
- **Drizzle ORM** - Type-safe database queries
- **Replit Auth** - Kimlik doğrulama

## Kurulum

### Gereksinimler
- Node.js 20+
- PostgreSQL 16+

### Adımlar

1. Repoyu klonlayın:
```bash
git clone https://github.com/[kullanici-adi]/rotamuni.git
cd rotamuni
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Veritabanı tablolarını oluşturun:
```bash
npm run db:push
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

Uygulama `http://localhost:5000` adresinde çalışmaya başlayacaktır.

## Production Build

Production için build almak:
```bash
npm run build
```

Production sunucusunu başlatmak:
```bash
npm start
```

## 📁 Proje Yapısı

```
rotamuni/
├── client/                 # Frontend React uygulaması
│   ├── src/
│   │   ├── components/    # UI bileşenleri
│   │   ├── pages/         # Sayfa bileşenleri
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Yardımcı fonksiyonlar
│   │   └── contexts/      # React Context'leri
│   └── public/            # Statik dosyalar
├── server/                # Backend Express uygulaması
│   ├── app.ts            # Express app konfigürasyonu
│   ├── routes.ts         # API route'ları
│   ├── storage.ts        # Veritabanı işlemleri
│   └── replitAuth.ts     # Kimlik doğrulama
├── shared/               # Frontend ve Backend arası paylaşılan tipler
└── package.json          # Proje bağımlılıkları
```

## Tasarım

- **Mobil-öncelikli** responsive tasarım
- **Pastel renk paleti** - Göz yormuyan, rahatlatıcı renkler
- **Poppins** font ailesi
- **Dark mode** varsayılan tema
- **Accessibility** odaklı - WCAG standartlarına uygun

## Güvenlik

- Replit OAuth entegrasyonu
- Session-based authentication
- Her kullanıcının verisi izole
- Input validation (Zod schemas)
- SQL injection koruması (Drizzle ORM)

## Özellikler

### Anasayfa (Dashboard)
4 ana modül kartı ile kolay erişim:
- To-Do List
- Soru Sayacı
- Çalışma Zamanlayıcısı
- Analiz ve İstatistikler

### Analiz Sayfası
- Haftalık çalışma süreleri grafiği
- Aylık çalışma süreleri grafiği
- Ders bazında soru dağılımı
- Günlük ortalama çalışma süresi
- Toplam çözülen soru sayısı

### Net Takibi
- TYT/AYT deneme girişi
- Ders bazında doğru/yanlış sayısı
- Otomatik net hesaplama
- Zaman içinde net değişimi grafiği
- Son 10 deneme performans tablosu

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## Geliştirici

**YKS Yol Arkadaşım** - YKS'ye hazırlanan öğrencilere yardımcı olmak için geliştirilmiştir.

## Teşekkürler

- [Replit](https://replit.com) - Hosting ve development platform
- [shadcn/ui](https://ui.shadcn.com) - UI component library
- [Radix UI](https://www.radix-ui.com) - Accessible components
- [Recharts](https://recharts.org) - Charting library

---

Projeyi beğendiyseniz yıldız vermeyi unutmayın!

[Hata Bildir veya İstekte Bulun](https://github.com/Furchlo5/rotamuni-website-project/issues)
