import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play, Pause, RotateCcw, Plus, X, Timer, Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTimer } from "@/contexts/TimerContext";
import type { TimerSession } from "@shared/schema";

const defaultSubjects = [
  "TYT Türkçe",
  "TYT Tarih",
  "TYT Coğrafya",
  "TYT Felsefe",
  "TYT Din Kültürü",
  "TYT Matematik",
  "TYT Geometri",
  "TYT Fizik",
  "TYT Kimya",
  "TYT Biyoloji",
  "AYT Edebiyat",
  "AYT Tarih",
  "AYT Coğrafya",
  "AYT Felsefe",
  "AYT Din Kültürü",
  "AYT Matematik",
  "AYT Fizik",
  "AYT Kimya",
  "AYT Biyoloji",
];

const CUSTOM_SUBJECTS_KEY = "rotamuni_custom_subjects";

function getCustomSubjects(): string[] {
  try {
    const stored = localStorage.getItem(CUSTOM_SUBJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCustomSubjects(subjects: string[]) {
  localStorage.setItem(CUSTOM_SUBJECTS_KEY, JSON.stringify(subjects));
}

const pomodoroPresets = [
  { label: "25 dakika", value: 25 },
  { label: "30 dakika", value: 30 },
  { label: "45 dakika", value: 45 },
  { label: "50 dakika", value: 50 },
  { label: "60 dakika", value: 60 },
];

export default function TimerPage() {
  const [customSubjects, setCustomSubjects] = useState<string[]>(getCustomSubjects());
  const [newSubjectName, setNewSubjectName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customPomodoroMinutes, setCustomPomodoroMinutes] = useState("");
  
  const {
    seconds,
    isRunning,
    selectedSubject,
    setSelectedSubject,
    startTimer,
    pauseTimer,
    resetTimer,
    saveTimer,
    pomodoroSeconds,
    pomodoroMinutes,
    pomodoroRunning,
    pomodoroCompleted,
    pomodoroElapsed,
    setPomodoroMinutes,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    savePomodoro,
    isSaving,
  } = useTimer();
  
  const allSubjects = [...defaultSubjects, ...customSubjects];
  
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  const {
    data: sessions = [],
    isLoading: loadingSessions,
  } = useQuery<TimerSession[]>({
    queryKey: ["/api/timer-sessions", today],
  });

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPomodoroTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCustomPomodoro = () => {
    const mins = parseInt(customPomodoroMinutes);
    if (mins > 0 && mins <= 180) {
      setPomodoroMinutes(mins);
      setCustomPomodoroMinutes("");
    } else {
      toast({
        title: "Hata!",
        description: "Lütfen 1-180 dakika arasında bir değer girin.",
        variant: "destructive",
      });
    }
  };

  const handleAddSubject = () => {
    const trimmed = newSubjectName.trim();
    if (!trimmed) {
      toast({
        title: "Hata!",
        description: "Lütfen bir ders adı girin.",
        variant: "destructive",
      });
      return;
    }
    if (allSubjects.includes(trimmed)) {
      toast({
        title: "Hata!",
        description: "Bu ders zaten listede mevcut.",
        variant: "destructive",
      });
      return;
    }
    const updated = [...customSubjects, trimmed];
    setCustomSubjects(updated);
    saveCustomSubjects(updated);
    setSelectedSubject(trimmed);
    setNewSubjectName("");
    setDialogOpen(false);
    toast({
      title: "Ders eklendi!",
      description: `"${trimmed}" ders listesine eklendi.`,
    });
  };

  const handleRemoveCustomSubject = (subject: string) => {
    const updated = customSubjects.filter((s) => s !== subject);
    setCustomSubjects(updated);
    saveCustomSubjects(updated);
    if (selectedSubject === subject) {
      setSelectedSubject(allSubjects[0]);
    }
    toast({
      title: "Ders silindi",
      description: `"${subject}" ders listesinden kaldırıldı.`,
    });
  };

  const todayTotal = sessions.reduce((sum, s) => sum + s.duration, 0);
  const subjectTotal = sessions
    .filter((s) => s.subject === selectedSubject)
    .reduce((sum, s) => sum + s.duration, 0);

  const progress = pomodoroMinutes > 0 
    ? ((pomodoroMinutes * 60 - pomodoroSeconds) / (pomodoroMinutes * 60)) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-6 mb-6 shadow-lg">
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
                Çalışılan Süre
              </h1>
              <p className="text-white/90 text-sm mt-1">
                {loadingSessions ? (
                  <span className="inline-block w-32 h-4 bg-white/20 rounded animate-pulse" />
                ) : (
                  `Bugün toplam: ${formatTime(todayTotal)}`
                )}
              </p>
            </div>
            {(isRunning || pomodoroRunning) && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">Çalışıyor</span>
              </div>
            )}
          </div>
        </div>

        <Card className="p-6 md:p-8 mb-6 shadow-md">
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Çalışılan Ders
            </label>
            <div className="flex gap-2">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="flex-1" data-testid="select-subject">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5">TYT Dersleri</div>
                  {defaultSubjects.filter(s => s.startsWith("TYT")).map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                  <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5 mt-2">AYT Dersleri</div>
                  {defaultSubjects.filter(s => s.startsWith("AYT")).map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                  {customSubjects.length > 0 && (
                    <>
                      <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5 mt-2">Özel Dersler</div>
                      {customSubjects.map((subject) => (
                        <div key={subject} className="flex items-center justify-between pr-2">
                          <SelectItem value={subject} className="flex-1">
                            {subject}
                          </SelectItem>
                        </div>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-950"
                    data-testid="button-add-subject"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Ders Ekle</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Ders Adı
                      </label>
                      <Input
                        placeholder="Örn: İngilizce, Almanca..."
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddSubject()}
                        data-testid="input-new-subject"
                      />
                    </div>
                    <Button
                      onClick={handleAddSubject}
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                      data-testid="button-confirm-add-subject"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ekle
                    </Button>
                    
                    {customSubjects.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Eklenen Dersler
                        </h4>
                        <div className="space-y-2">
                          {customSubjects.map((subject) => (
                            <div
                              key={subject}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded"
                            >
                              <span className="text-sm">{subject}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveCustomSubject(subject)}
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                data-testid={`button-remove-subject-${subject}`}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue="stopwatch" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="stopwatch" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Kronometre
                {isRunning && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
              </TabsTrigger>
              <TabsTrigger value="pomodoro" className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Pomodoro
                {pomodoroRunning && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stopwatch">
              <div className="text-center mb-8">
                <div
                  className="text-6xl md:text-7xl font-bold text-foreground mb-2 font-mono"
                  data-testid="text-timer"
                >
                  {formatTime(seconds)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {loadingSessions ? (
                    <span className="inline-block w-48 h-4 bg-muted rounded animate-pulse" />
                  ) : (
                    `${selectedSubject} için bugün: ${formatTime(subjectTotal)}`
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  size="lg"
                  onClick={isRunning ? pauseTimer : startTimer}
                  className="w-32 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
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
                  onClick={saveTimer}
                  disabled={seconds === 0 || isRunning || isSaving}
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                  data-testid="button-save-timer"
                >
                  Kaydet
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetTimer}
                  disabled={seconds === 0 || isRunning}
                  className="border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-950"
                  data-testid="button-reset-timer"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Sıfırla
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="pomodoro">
              <div className="mb-6">
                <label className="text-sm font-medium text-muted-foreground mb-3 block">
                  Pomodoro Süresi
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {pomodoroPresets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={pomodoroMinutes === preset.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPomodoroMinutes(preset.value)}
                      disabled={pomodoroRunning}
                      className={pomodoroMinutes === preset.value 
                        ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white" 
                        : "border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-950"
                      }
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Özel süre (dakika)"
                    value={customPomodoroMinutes}
                    onChange={(e) => setCustomPomodoroMinutes(e.target.value)}
                    disabled={pomodoroRunning}
                    className="flex-1"
                    min={1}
                    max={180}
                  />
                  <Button
                    variant="outline"
                    onClick={handleCustomPomodoro}
                    disabled={pomodoroRunning || !customPomodoroMinutes}
                    className="border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-950"
                  >
                    Ayarla
                  </Button>
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <svg className="w-48 h-48 md:w-56 md:h-56 transform -rotate-90" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-muted/30"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      stroke="url(#pomodoroGradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 90}
                      strokeDashoffset={2 * Math.PI * 90 * (1 - progress / 100)}
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id="pomodoroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div
                      className="text-4xl md:text-5xl font-bold text-foreground font-mono"
                      data-testid="text-pomodoro-timer"
                    >
                      {formatPomodoroTime(pomodoroSeconds)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {pomodoroCompleted ? "Tamamlandı! 🎉" : pomodoroRunning ? "Çalışıyor..." : "Hazır"}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-4">
                  {loadingSessions ? (
                    <span className="inline-block w-48 h-4 bg-muted rounded animate-pulse" />
                  ) : (
                    `${selectedSubject} için bugün: ${formatTime(subjectTotal)}`
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  size="lg"
                  onClick={pomodoroRunning ? pausePomodoro : startPomodoro}
                  disabled={pomodoroCompleted}
                  className="w-32 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                  data-testid="button-toggle-pomodoro"
                >
                  {pomodoroRunning ? (
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
                {pomodoroElapsed > 0 && !pomodoroRunning && !pomodoroCompleted && (
                  <Button
                    size="lg"
                    onClick={savePomodoro}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                    data-testid="button-save-pomodoro"
                  >
                    Kaydet
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetPomodoro}
                  disabled={pomodoroRunning}
                  className="border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-950"
                  data-testid="button-reset-pomodoro"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Sıfırla
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6 shadow-md">
          <h3 className="font-semibold text-lg mb-4">Bugünkü Kayıtlar</h3>
          {loadingSessions ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Henüz kayıt yok. Çalışmaya başla!
            </p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <span className="font-medium">{session.subject}</span>
                  <span className="text-teal-600 dark:text-teal-400 font-mono">
                    {formatTime(session.duration)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
