import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, TrendingUp, Clock, Target } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

export default function AnalysisPage() {
  const today = new Date().toISOString().split("T")[0];

  const {
    data: questionCounts = [],
    isLoading: loadingQuestions,
    isError: errorQuestions,
  } = useQuery<QuestionCount[]>({
    queryKey: ["/api/question-counts", today],
  });

  const {
    data: timerSessions = [],
    isLoading: loadingSessions,
    isError: errorSessions,
  } = useQuery<TimerSession[]>({
    queryKey: ["/api/timer-sessions", today],
  });

  const totalQuestions = questionCounts.reduce((sum, c) => sum + c.count, 0);
  const totalTime = timerSessions.reduce((sum, s) => sum + s.duration, 0);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}s ${minutes}dk`;
  };

  const questionData = questionCounts
    .filter((c) => c.count > 0)
    .map((c) => ({
      subject: c.subject,
      count: c.count,
    }));

  const timeData = timerSessions.reduce((acc: any[], session) => {
    const existing = acc.find((item) => item.subject === session.subject);
    if (existing) {
      existing.duration += session.duration;
    } else {
      acc.push({
        subject: session.subject,
        duration: Math.floor(session.duration / 60),
      });
    }
    return acc;
  }, []);

  const isLoading = loadingQuestions || loadingSessions;
  const hasError = errorQuestions || errorSessions;

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
                Bugünkü performansın
              </p>
            </div>
          </div>
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
