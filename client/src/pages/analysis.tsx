import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, TrendingUp, Clock, Target } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "recharts";
import type { QuestionCount, TimerSession } from "@shared/schema";

const COLORS = [
  "#93c5fd",
  "#86efac",
  "#fde047",
  "#fdba74",
  "#c4b5fd",
  "#5eead4",
  "#fb923c",
  "#f9a8d4",
];

type Period = "daily" | "weekly" | "monthly";

export default function AnalysisPage() {
  const [period, setPeriod] = useState<Period>("daily");
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
        `/api/stats?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 rounded-2xl p-6 mb-6 shadow-lg">
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
              <p className="text-blue-50 text-sm mt-1">
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
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Toplam Soru</div>
                <div className="text-2xl font-bold" data-testid="text-total-questions">
                  {totalQuestions}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Çalışma Süresi</div>
                <div className="text-2xl font-bold" data-testid="text-total-time">
                  {formatTime(totalTime)}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Ders Sayısı</div>
                <div className="text-2xl font-bold" data-testid="text-subject-count">
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
              <Card key={i} className="p-6">
                <div className="h-6 w-48 bg-muted rounded animate-pulse mb-4" />
                <div className="h-64 bg-muted rounded animate-pulse" />
              </Card>
            ))}
          </div>
        ) : hasError ? (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-destructive font-semibold mb-2">Veri yüklenemedi</p>
              <p className="text-muted-foreground text-sm">
                Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
              </p>
            </div>
          </Card>
        ) : questionData.length === 0 && timeData.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz veri yok</h3>
              <p className="text-muted-foreground">
                Çalışmaya başladığında burada istatistiklerini görebileceksin!
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {questionData.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">
                  Ders Bazında Soru Dağılımı
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={questionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="subject"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {timeData.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">
                  Ders Bazında Çalışma Süresi (dk)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={timeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ subject, duration }) => `${subject}: ${duration}dk`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="duration"
                    >
                      {timeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
