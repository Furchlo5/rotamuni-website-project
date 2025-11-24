import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TimerSession } from "@shared/schema";

const subjects = [
  "Türkçe",
  "Matematik",
  "Fen Bilimleri",
  "Sosyal Bilimler",
  "Tarih",
  "Coğrafya",
  "Felsefe",
  "Din Kültürü",
];

export default function TimerPage() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  const { data: sessions = [] } = useQuery<TimerSession[]>({
    queryKey: ["/api/timer-sessions", today],
  });

  const saveMutation = useMutation({
    mutationFn: (duration: number) =>
      apiRequest("POST", "/api/timer-sessions", {
        duration,
        subject: selectedSubject,
        date: today,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timer-sessions", today] });
      toast({
        title: "Çalışma kaydedildi!",
        description: `${formatTime(seconds)} süre kaydedildi.`,
      });
    },
  });

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    if (seconds > 0 && !isRunning) {
      saveMutation.mutate(seconds);
    }
    setSeconds(0);
    setIsRunning(false);
  };

  const todayTotal = sessions.reduce((sum, s) => sum + s.duration, 0);
  const subjectTotal = sessions
    .filter((s) => s.subject === selectedSubject)
    .reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
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
                Çalışma Timer
              </h1>
              <p className="text-blue-50 text-sm mt-1">
                Bugün toplam: {formatTime(todayTotal)}
              </p>
            </div>
          </div>
        </div>

        <Card className="p-6 md:p-8 mb-6">
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Çalışılan Ders
            </label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger data-testid="select-subject">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-center mb-8">
            <div
              className="text-6xl md:text-7xl font-bold text-foreground mb-2 font-mono"
              data-testid="text-timer"
            >
              {formatTime(seconds)}
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedSubject} için bugün: {formatTime(subjectTotal)}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => setIsRunning(!isRunning)}
              className="w-32"
              data-testid="button-toggle-timer"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Duraklat
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Başlat
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleReset}
              disabled={seconds === 0}
              data-testid="button-reset-timer"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Sıfırla
            </Button>
          </div>
        </Card>

        {sessions.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Bugünkü Seanslar</h3>
            <div className="space-y-2">
              {sessions.slice(-5).reverse().map((session, idx) => (
                <div
                  key={session.id}
                  className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded"
                  data-testid={`session-${idx}`}
                >
                  <span className="font-medium">{session.subject}</span>
                  <span className="text-muted-foreground">
                    {formatTime(session.duration)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
