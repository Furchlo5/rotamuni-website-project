import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, TrendingUp, Clock, Target, Calculator, X } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import type { QuestionCount, TimerSession, NetResult } from "@shared/schema";

const SUBJECT_COLORS: Record<string, string> = {
  "Matematik": "#14b8a6",
  "Fizik": "#f59e0b",
  "Kimya": "#8b5cf6",
  "Biyoloji": "#22c55e",
  "Türkçe": "#ef4444",
  "Tarih": "#3b82f6",
  "Coğrafya": "#ec4899",
  "Felsefe": "#f97316",
  "Din Kültürü": "#06b6d4",
  "İngilizce": "#6366f1",
  "Edebiyat": "#a855f7",
  "Geometri": "#10b981",
};

const DEFAULT_COLORS = [
  "#14b8a6",
  "#f59e0b",
  "#8b5cf6",
  "#22c55e",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#f97316",
  "#06b6d4",
  "#6366f1",
];

const getSubjectColor = (subject: string, index: number): string => {
  return SUBJECT_COLORS[subject] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

type Period = "daily" | "weekly" | "monthly";

interface NetResultWithDate extends NetResult {
  formattedDate: string;
}

export default function AnalysisPage() {
  const [period, setPeriod] = useState<Period>("daily");
  const [selectedResult, setSelectedResult] = useState<NetResult | null>(null);
  const today = new Date();
  
  const getDateRange = () => {
    const endDate = today.toISOString().split("T")[0];
    let startDate: string;
    
    switch (period) {
      case "daily":
        startDate = endDate;
        break;
      case "weekly":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 6);
        startDate = weekAgo.toISOString().split("T")[0];
        break;
      case "monthly":
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 29);
        startDate = monthAgo.toISOString().split("T")[0];
        break;
    }
    
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  const {
    data: statsData,
    isLoading,
    isError: hasError,
  } = useQuery<{ questionCounts: QuestionCount[]; timerSessions: TimerSession[] }>({
    queryKey: ["/api/stats", startDate, endDate],
    queryFn: async () => {
      const response = await fetch(
        `/api/stats?startDate=${startDate}&endDate=${endDate}`,
        { credentials: "include" }
      );
      if (response.status === 401) return { questionCounts: [], timerSessions: [] };
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: netResults = [] } = useQuery<NetResult[]>({
    queryKey: ["/api/net-results"],
    queryFn: async () => {
      const response = await fetch("/api/net-results", {
        credentials: "include",
      });
      if (response.status === 401) return [];
      if (!response.ok) throw new Error("Failed to fetch net results");
      const data = await response.json();
      return data.map((result: NetResult) => ({
        ...result,
        totalNet: String(result.totalNet),
        subjectScores: typeof result.subjectScores === 'object' 
          ? Object.fromEntries(
              Object.entries(result.subjectScores as Record<string, any>).map(([key, value]) => [
                key,
                {
                  correct: Number(value.correct) || 0,
                  wrong: Number(value.wrong) || 0,
                  net: Number(value.net) || 0,
                }
              ])
            )
          : result.subjectScores,
      }));
    },
  });

  const questionCounts = statsData?.questionCounts || [];
  const timerSessions = statsData?.timerSessions || [];

  const aggregatedQuestions = questionCounts.reduce((acc: Record<string, number>, c) => {
    acc[c.subject] = (acc[c.subject] || 0) + c.count;
    return acc;
  }, {});

  const aggregatedTime = timerSessions.reduce((acc: Record<string, number>, s) => {
    acc[s.subject] = (acc[s.subject] || 0) + s.duration;
    return acc;
  }, {});

  const totalQuestions = Object.values(aggregatedQuestions).reduce((sum, count) => sum + count, 0);
  const totalTime = Object.values(aggregatedTime).reduce((sum, duration) => sum + duration, 0);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}s ${minutes}dk`;
  };

  const questionData = Object.entries(aggregatedQuestions)
    .filter(([_, count]) => count > 0)
    .map(([subject, count]) => ({
      subject,
      count,
    }));

  const timeData = Object.entries(aggregatedTime)
    .map(([subject, duration]) => ({
      subject,
      duration: Math.floor(duration / 60),
    }))
    .filter((item) => item.duration > 0);

  const periodLabels = {
    daily: "Bugün",
    weekly: "Bu Hafta",
    monthly: "Bu Ay",
  };

  const tytResults = netResults
    .filter((r) => r.examType === "TYT")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const aytResults = netResults
    .filter((r) => r.examType === "AYT")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatChartDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const tytChartData = tytResults
    .map((r) => ({
      ...r,
      formattedDate: formatChartDate(r.date),
      net: parseFloat(r.totalNet),
    }))
    .filter((r) => !isNaN(r.net));

  const aytChartData = aytResults
    .map((r) => ({
      ...r,
      formattedDate: formatChartDate(r.date),
      net: parseFloat(r.totalNet),
    }))
    .filter((r) => !isNaN(r.net));

  const handlePointClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const result = data.activePayload[0].payload as NetResult;
      setSelectedResult(result);
    }
  };

  const getAytFieldLabel = (field: string | null) => {
    switch (field) {
      case "sozel": return "Sözel";
      case "esit": return "Eşit Ağırlık";
      case "sayisal": return "Sayısal";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-cyan-500 to-teal-600 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white" data-testid="text-page-title">
                Analiz ve İstatistikler
              </h1>
              <p className="text-white/90 text-sm mt-1">
                {periodLabels[period]} performansın
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="daily" data-testid="tab-daily">Günlük</TabsTrigger>
              <TabsTrigger value="weekly" data-testid="tab-weekly">Haftalık</TabsTrigger>
              <TabsTrigger value="monthly" data-testid="tab-monthly">Aylık</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 shadow-md">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-teal-500/20 rounded-lg">
                <Target className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Toplam Soru</div>
                <div className="text-2xl font-bold text-teal-400" data-testid="text-total-questions">
                  {totalQuestions}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-md">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-teal-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Çalışma Süresi</div>
                <div className="text-2xl font-bold text-teal-400" data-testid="text-total-time">
                  {formatTime(totalTime)}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-md">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-teal-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Ders Sayısı</div>
                <div className="text-2xl font-bold text-teal-400" data-testid="text-subject-count">
                  {new Set([
                    ...questionCounts.filter((c) => c.count > 0).map((c) => c.subject),
                    ...timerSessions.map((s) => s.subject),
                  ]).size}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="p-6 shadow-md">
                <div className="h-6 w-48 bg-muted rounded animate-pulse mb-4" />
                <div className="h-64 bg-muted rounded animate-pulse" />
              </Card>
            ))}
          </div>
        ) : hasError ? (
          <Card className="p-12 shadow-md">
            <div className="text-center">
              <p className="text-destructive font-semibold mb-2">Veri yüklenemedi</p>
              <p className="text-muted-foreground text-sm">
                Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="p-6 shadow-md">
                <h3 className="font-semibold text-lg mb-4">
                  Ders Bazında Soru Dağılımı
                </h3>
                {questionData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={questionData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                          dataKey="subject"
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        <Tooltip formatter={(value: number) => [`${value} soru`, 'Sayı']} />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {questionData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getSubjectColor(entry.subject, index)}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      {questionData.map((entry, index) => (
                        <div key={entry.subject} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: getSubjectColor(entry.subject, index) }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {entry.subject}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[250px] flex flex-col items-center justify-center">
                    <Target className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-sm">Henüz soru kaydı yok</p>
                  </div>
                )}
              </Card>

              <Card className="p-6 shadow-md">
                <h3 className="font-semibold text-lg mb-4">
                  Ders Bazında Çalışma Süresi
                </h3>
                {timeData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={timeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={90}
                          innerRadius={50}
                          fill="#8884d8"
                          dataKey="duration"
                          paddingAngle={2}
                        >
                          {timeData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getSubjectColor(entry.subject, index)}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value} dakika`, 'Süre']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      {timeData.map((entry, index) => (
                        <div key={entry.subject} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: getSubjectColor(entry.subject, index) }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {entry.subject} ({entry.duration}dk)
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[250px] flex flex-col items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-4 border-dashed border-muted-foreground/30 flex items-center justify-center mb-4">
                      <Clock className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                    <p className="text-muted-foreground text-sm">Henüz çalışma kaydı yok</p>
                  </div>
                )}
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 shadow-md">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-teal-500" />
                  TYT Net Gelişimi
                </h3>
                {tytChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={tytChartData} onClick={handlePointClick}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="formattedDate" 
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis domain={[0, 'auto']} />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(2)} net`, 'Toplam']}
                        labelFormatter={(label) => `Tarih: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="net" 
                        stroke="#14b8a6" 
                        strokeWidth={2}
                        dot={{ fill: "#14b8a6", strokeWidth: 2, r: 5, cursor: "pointer" }}
                        activeDot={{ r: 8, fill: "#0d9488", cursor: "pointer" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex flex-col items-center justify-center">
                    <Calculator className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-sm">Henüz TYT deneme sonucu yok</p>
                    <Link href="/net-tracking">
                      <Button variant="ghost" className="text-teal-500 hover:text-teal-600 hover:bg-teal-50 mt-2 underline">
                        Deneme Ekle
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>

              <Card className="p-6 shadow-md">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-cyan-500" />
                  AYT Net Gelişimi
                </h3>
                {aytChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={aytChartData} onClick={handlePointClick}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="formattedDate" 
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis domain={[0, 'auto']} />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(2)} net`, 'Toplam']}
                        labelFormatter={(label) => `Tarih: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="net" 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        dot={{ fill: "#06b6d4", strokeWidth: 2, r: 5, cursor: "pointer" }}
                        activeDot={{ r: 8, fill: "#0891b2", cursor: "pointer" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex flex-col items-center justify-center">
                    <Calculator className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-sm">Henüz AYT deneme sonucu yok</p>
                    <Link href="/net-tracking">
                      <Button variant="ghost" className="text-cyan-500 hover:text-cyan-600 hover:bg-cyan-50 mt-2 underline">
                        Deneme Ekle
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>

      {selectedResult && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedResult(null)}
        >
          <Card 
            className="w-full max-w-md p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">
                  {selectedResult.examType} Deneme Sonucu
                  {selectedResult.aytField && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({getAytFieldLabel(selectedResult.aytField)})
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedResult.date).toLocaleDateString("tr-TR")} - {selectedResult.publisher}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedResult(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-4 p-4 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl text-white">
              <div className="text-sm opacity-90">Toplam Net</div>
              <div className="text-3xl font-bold">{selectedResult.totalNet}</div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Ders Bazında Sonuçlar</h4>
              {Object.entries(selectedResult.subjectScores as Record<string, { correct: number; wrong: number; net: number }>).map(([subject, score]) => {
                const correct = Number(score.correct) || 0;
                const wrong = Number(score.wrong) || 0;
                const net = Number(score.net) || 0;
                return (
                  <div 
                    key={subject}
                    className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="font-medium text-sm">{subject}</span>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-green-600">D: {correct}</span>
                      <span className="text-red-500">Y: {wrong}</span>
                      <span className={`font-bold ${net >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
                        Net: {net.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
