import { Link } from "wouter";
import { ClipboardList, Calculator, Timer, BarChart } from "lucide-react";

const navigationCards = [
  {
    title: "To-Do List",
    path: "/todo",
    icon: ClipboardList,
    color: "bg-gradient-to-br from-orange-500 to-amber-600",
  },
  {
    title: "Soru Sayacı",
    path: "/counter",
    icon: Calculator,
    color: "bg-gradient-to-br from-teal-500 to-cyan-600",
  },
  {
    title: "Timer",
    path: "/timer",
    icon: Timer,
    color: "bg-gradient-to-br from-orange-600 to-amber-700",
  },
  {
    title: "Analiz",
    path: "/analysis",
    icon: BarChart,
    color: "bg-gradient-to-br from-cyan-500 to-teal-600",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-white" data-testid="text-welcome">
            YKS Yol Arkadaşım
          </h1>
          <p className="text-center text-white/90 mt-2 text-sm md:text-base">
            Çalışmalarını takip et, hedeflerine ulaş!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {navigationCards.map((card) => (
            <Link key={card.path} href={card.path}>
              <button
                className={`${card.color} rounded-2xl p-6 md:p-8 w-full transition-all duration-200 hover:brightness-110 active:brightness-90`}
                data-testid={`button-nav-${card.path.substring(1)}`}
              >
                <div className="flex flex-col items-center justify-center gap-3 text-[#0e0ddbd4]">
                  <card.icon className="w-12 h-12 md:w-16 md:h-16 text-white" />
                  <span className="font-semibold text-white text-sm md:text-base text-center">
                    {card.title}
                  </span>
                </div>
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
