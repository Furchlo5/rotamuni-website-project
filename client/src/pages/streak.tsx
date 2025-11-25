import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Flame, ChevronLeft, ChevronRight, Check, Clock, ArrowLeft } from "lucide-react";

interface DailyStudyData {
  date: string;
  totalSeconds: number;
}

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes} dakika`;
  }
  return `${hours} saat ${minutes} dakika`;
}

export default function StreakPage() {
  const [, navigate] = useLocation();
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<{ date: string; totalSeconds: number } | null>(null);

  const { data: streakData } = useQuery<{ streak: number }>({
    queryKey: ["/api/streak"],
  });

  const { data: monthlyData = [] } = useQuery<DailyStudyData[]>({
    queryKey: ["/api/monthly-study", selectedYear, selectedMonth],
    queryFn: async () => {
      const res = await fetch(`/api/monthly-study/${selectedYear}/${selectedMonth}`);
      if (!res.ok) throw new Error("Failed to fetch monthly data");
      return res.json();
    },
  });

  const studyDataMap = new Map(monthlyData.map(d => [d.date, d]));

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDayOfMonth = getFirstDayOfMonth(selectedYear, selectedMonth);

  const generateYears = () => {
    const years = [];
    for (let y = 2024; y <= now.getFullYear() + 1; y++) {
      years.push(y);
    }
    return years;
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const data = studyDataMap.get(dateStr);
    setSelectedDay(data || { date: dateStr, totalSeconds: 0 });
  };

  const totalMonthlySeconds = monthlyData.reduce((sum, d) => sum + d.totalSeconds, 0);
  const studyDaysCount = monthlyData.length;

  return (
    <div className="min-h-screen bg-[#0a1628] p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-white hover:bg-[#1e3a5f] flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Geri Dön
        </Button>

        <Card className="bg-gradient-to-b from-orange-500/10 via-red-500/20 to-yellow-500/10 border-orange-500/30 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 blur-2xl bg-gradient-to-t from-yellow-500/40 via-orange-500/50 to-red-500/40 rounded-full scale-110 animate-pulse" />
                <svg 
                  viewBox="0 0 24 24" 
                  className="h-36 w-36 relative z-10 drop-shadow-[0_0_25px_rgba(251,146,60,0.8)]"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(251,146,60,0.6))' }}
                >
                  <defs>
                    <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="30%" stopColor="#f97316" />
                      <stop offset="60%" stopColor="#ea580c" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                    <linearGradient id="flameInner" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#fef3c7" />
                      <stop offset="50%" stopColor="#fcd34d" />
                      <stop offset="100%" stopColor="#fb923c" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M12 2C10.5 4 9 5.5 9 8c0 1.5 0.5 2.5 1 3.5-1-0.5-2-2-2-4 0 0-2 2-2 5s1.5 5 3 6c-1-1-1.5-2.5-1.5-4 0-2 1.5-3.5 2.5-4.5 0 2 1 3.5 1 5.5 0 1.5-0.5 2.5-1 3.5 1 0.5 2.5 0.5 4 0-0.5-1-1-2-1-3.5 0-2 1-3.5 1-5.5 1 1 2.5 2.5 2.5 4.5 0 1.5-0.5 3-1.5 4 1.5-1 3-3 3-6s-2-5-2-5c0 2-1 3.5-2 4-0.5-1 1-2 1-3.5 0-2.5-1.5-4-3-6z" 
                    fill="url(#flameGradient)"
                  />
                  <path 
                    d="M12 8c-0.5 1-1 2-1 3.5 0 2 1 3 1.5 4 0.5-1 1.5-2 1.5-4 0-1.5-0.5-2.5-1-3.5-0.3 0.5-0.7 0.5-1 0z" 
                    fill="url(#flameInner)"
                    opacity="0.9"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <span className="text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] mt-2">
                    {streakData?.streak ?? 0}
                  </span>
                </div>
              </div>
              <div className="text-orange-300 text-xl font-semibold mt-4">Günlük Seri</div>
            </div>
            <p className="text-center text-orange-200/70 mt-4 text-sm">
              Her gün çalışarak serini sürdür!
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#152238] border-[#1e3a5f]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Aylık Çalışma Takvimi</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={String(selectedMonth)}
                  onValueChange={(v) => setSelectedMonth(parseInt(v))}
                >
                  <SelectTrigger className="w-[120px] bg-[#1e3a5f] border-[#2a4a6f] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e3a5f] border-[#2a4a6f]">
                    {MONTHS.map((month, idx) => (
                      <SelectItem key={idx} value={String(idx + 1)} className="text-white hover:bg-[#2a4a6f]">
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={String(selectedYear)}
                  onValueChange={(v) => setSelectedYear(parseInt(v))}
                >
                  <SelectTrigger className="w-[100px] bg-[#1e3a5f] border-[#2a4a6f] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e3a5f] border-[#2a4a6f]">
                    {generateYears().map((year) => (
                      <SelectItem key={year} value={String(year)} className="text-white hover:bg-[#2a4a6f]">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="text-white hover:bg-[#1e3a5f]"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h3 className="text-xl font-semibold text-white">
                {MONTHS[selectedMonth - 1]} {selectedYear}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="text-white hover:bg-[#1e3a5f]"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-sm text-white/50 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const studyData = studyDataMap.get(dateStr);
                const hasStudied = !!studyData;
                const isToday = 
                  day === now.getDate() && 
                  selectedMonth === now.getMonth() + 1 && 
                  selectedYear === now.getFullYear();

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center relative
                      transition-all duration-200 cursor-pointer
                      ${hasStudied 
                        ? 'bg-teal-500/30 hover:bg-teal-500/50' 
                        : 'bg-[#1e3a5f]/50 hover:bg-[#2a4a6f]/50'}
                      ${isToday ? 'ring-2 ring-teal-400' : ''}
                    `}
                  >
                    <span className={`text-sm ${hasStudied ? 'text-white' : 'text-white/60'}`}>
                      {day}
                    </span>
                    {hasStudied && (
                      <Check className="h-4 w-4 text-teal-400 absolute bottom-1" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-[#1e3a5f]/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-teal-400">{studyDaysCount}</div>
                <div className="text-sm text-white/60">Çalışılan Gün</div>
              </div>
              <div className="bg-[#1e3a5f]/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-teal-400">
                  {Math.floor(totalMonthlySeconds / 3600)}s {Math.floor((totalMonthlySeconds % 3600) / 60)}d
                </div>
                <div className="text-sm text-white/60">Toplam Süre</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-4 text-sm text-white/50">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-teal-500/30" />
            <span>Çalışıldı</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#1e3a5f]/50" />
            <span>Çalışılmadı</span>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="bg-[#152238] border-[#1e3a5f] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-400" />
              {selectedDay && new Date(selectedDay.date).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="text-center">
              {selectedDay && selectedDay.totalSeconds > 0 ? (
                <>
                  <div className="text-4xl font-bold text-teal-400 mb-2">
                    {formatDuration(selectedDay.totalSeconds)}
                  </div>
                  <p className="text-white/60">Bu gün toplam çalışma süreniz</p>
                </>
              ) : (
                <>
                  <div className="text-4xl font-bold text-white/40 mb-2">
                    0 dakika
                  </div>
                  <p className="text-white/60">Bu gün çalışma kaydı yok</p>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
