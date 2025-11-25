import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { ClipboardList, Calculator, Clock, BarChart } from "lucide-react";

const features = [
  {
    title: "To-Do List",
    description: "Günlük hedeflerinizi belirleyin ve takip edin",
    path: "/todo",
    icon: ClipboardList,
  },
  {
    title: "Soru Sayısı Takibi",
    description: "Ders ders çözdüğünüz soruları kaydedin",
    path: "/counter",
    icon: Calculator,
  },
  {
    title: "Zamanlayıcı",
    description: "Çalışma sürenizi ölçün ve kaydedin",
    path: "/timer",
    icon: Clock,
  },
  {
    title: "Analiz",
    description: "İlerlemenizi grafiklerle görselleştirin",
    path: "/analysis",
    icon: BarChart,
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0a1628] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12" data-testid="text-features-title">
          Özellikler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link key={feature.path} href={feature.path}>
              <Card 
                className="bg-[#152238] border-[#1e3a5f] p-6 hover:border-[#14b8a6] transition-all cursor-pointer h-full"
                data-testid={`card-feature-${feature.path.substring(1)}`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-[#14b8a6]/20 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-[#14b8a6]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
