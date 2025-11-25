import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, BarChart3, Clock, ListTodo } from "lucide-react";
import logoImage from "@assets/Screenshot 2025-11-25 at 09.35 Background Removed.14_1764052549610.png";
import backgroundVideo from "@assets/main_video_1764052786108.mp4";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a1628] relative">
      {/* Background Video */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover"
          data-testid="video-background"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-[#0a1628]/70" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <img 
                src={logoImage} 
                alt="YKS Yol Arkadaşım Logo" 
                className="h-48 w-48 object-contain"
                data-testid="img-hero-logo"
              />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              YKS Yol Arkadaşım
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              YKS sınavına hazırlanırken çalışma sürenizi, çözdüğünüz soru sayısını 
              ve hedeflerinizi takip edin. Başarıya giden yolda yanınızdayız! 🚀
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => window.location.href = "/api/login"}
                className="bg-gradient-to-r from-[#14b8a6] to-[#0891b2] hover:from-[#2dd4bf] hover:to-[#06b6d4] text-white text-lg h-14 px-8"
                data-testid="button-get-started"
              >
                Hemen Başla
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.location.href = "/api/login"}
                className="border-[#14b8a6] text-[#14b8a6] hover:bg-[#14b8a6]/10 text-lg h-14 px-8"
                data-testid="button-signin-hero"
              >
                Giriş Yap
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Özellikler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Todo List */}
          <Card className="bg-[#152238] border-[#1e3a5f] p-6 hover:border-[#14b8a6] transition-colors">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-[#14b8a6]/20 flex items-center justify-center mb-4">
                <ListTodo className="h-6 w-6 text-[#14b8a6]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                To-Do List
              </h3>
              <p className="text-white/60 text-sm">
                Günlük hedeflerinizi belirleyin ve takip edin
              </p>
            </div>
          </Card>

          {/* Question Counter */}
          <Card className="bg-[#152238] border-[#1e3a5f] p-6 hover:border-[#14b8a6] transition-colors">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-[#14b8a6]/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-[#14b8a6]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Soru Sayacı
              </h3>
              <p className="text-white/60 text-sm">
                Çözdüğünüz soruları günlük olarak kaydedin
              </p>
            </div>
          </Card>

          {/* Timer */}
          <Card className="bg-[#152238] border-[#1e3a5f] p-6 hover:border-[#14b8a6] transition-colors">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-[#14b8a6]/20 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-[#14b8a6]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Çalışma Timer
              </h3>
              <p className="text-white/60 text-sm">
                Çalışma sürenizi ölçün ve kaydedin
              </p>
            </div>
          </Card>

          {/* Analysis */}
          <Card className="bg-[#152238] border-[#1e3a5f] p-6 hover:border-[#14b8a6] transition-colors">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-[#14b8a6]/20 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-[#14b8a6]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Analiz
              </h3>
              <p className="text-white/60 text-sm">
                İlerlemenizi grafiklerle görselleştirin
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-gradient-to-r from-[#14b8a6] to-[#0891b2] border-0 p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Hazır mısınız?
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            YKS yolculuğunuzda size eşlik edelim. Ücretsiz başlayın!
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            className="bg-white text-[#14b8a6] hover:bg-white/90 text-lg h-14 px-8"
            data-testid="button-cta"
          >
            Ücretsiz Başla
          </Button>
        </Card>
      </div>
    </div>
  );
}
