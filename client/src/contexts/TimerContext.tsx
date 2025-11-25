import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TimerContextType {
  seconds: number;
  isRunning: boolean;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  saveTimer: () => void;
  
  pomodoroSeconds: number;
  pomodoroMinutes: number;
  pomodoroRunning: boolean;
  pomodoroCompleted: boolean;
  pomodoroElapsed: number;
  setPomodoroMinutes: (minutes: number) => void;
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  savePomodoro: () => void;
  
  isSaving: boolean;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

class BellSound {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  initialize() {
    if (this.isInitialized) return;
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  async play() {
    if (!this.audioContext) {
      this.initialize();
    }
    
    if (!this.audioContext) return;

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const playBell = (startTime: number, frequency: number, duration: number) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);
      
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = this.audioContext.currentTime;
    
    playBell(now, 830, 0.6);
    playBell(now + 0.1, 1046, 0.5);
    playBell(now + 0.2, 1318, 0.4);
    
    playBell(now + 0.8, 830, 0.6);
    playBell(now + 0.9, 1046, 0.5);
    playBell(now + 1.0, 1318, 0.4);
    
    playBell(now + 1.6, 830, 0.6);
    playBell(now + 1.7, 1046, 0.5);
    playBell(now + 1.8, 1318, 0.4);
  }
}

const bellSound = new BellSound();

export function TimerProvider({ children }: { children: ReactNode }) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("TYT Matematik");
  
  const [pomodoroMinutes, setPomodoroMinutesState] = useState(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroCompleted, setPomodoroCompleted] = useState(false);
  const [pomodoroElapsed, setPomodoroElapsed] = useState(0);
  
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const initAudio = () => {
      bellSound.initialize();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
    
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
    
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  const playAlarm = useCallback(() => {
    bellSound.play();
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Tamamlandı! 🎉', {
        body: 'Çalışma süreniz bitti. Mola zamanı!',
        icon: '/favicon.ico',
        tag: 'pomodoro-complete'
      });
    }
  }, []);

  const saveMutation = useMutation({
    mutationFn: (data: { duration: number; subject: string }) =>
      apiRequest("POST", "/api/timer-sessions", {
        duration: data.duration,
        subject: data.subject,
        date: today,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/timer-sessions", today] });
      queryClient.invalidateQueries({ queryKey: ["/api/streak"] });
      const hours = Math.floor(variables.duration / 3600);
      const minutes = Math.floor((variables.duration % 3600) / 60);
      const secs = variables.duration % 60;
      const timeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      toast({
        title: "Çalışma kaydedildi!",
        description: `${timeStr} süre kaydedildi.`,
      });
    },
    onError: () => {
      toast({
        title: "Hata!",
        description: "Çalışma kaydedilemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
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

  useEffect(() => {
    let interval: number | undefined;
    if (pomodoroRunning && pomodoroSeconds > 0) {
      interval = window.setInterval(() => {
        setPomodoroSeconds((s) => s - 1);
        setPomodoroElapsed((e) => e + 1);
      }, 1000);
    } else if (pomodoroRunning && pomodoroSeconds === 0) {
      setPomodoroRunning(false);
      setPomodoroCompleted(true);
      playAlarm();
      if (pomodoroElapsed > 0 && !saveMutation.isPending) {
        saveMutation.mutate({ duration: pomodoroElapsed, subject: selectedSubject });
      }
      toast({
        title: "Pomodoro tamamlandı! 🎉",
        description: `${pomodoroMinutes} dakikalık çalışma süresi tamamlandı.`,
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoroRunning, pomodoroSeconds, pomodoroMinutes, pomodoroElapsed, saveMutation, toast, selectedSubject, playAlarm]);

  const startTimer = useCallback(() => setIsRunning(true), []);
  const pauseTimer = useCallback(() => setIsRunning(false), []);
  const resetTimer = useCallback(() => {
    setSeconds(0);
    setIsRunning(false);
  }, []);
  const saveTimer = useCallback(() => {
    if (seconds > 0 && !saveMutation.isPending) {
      saveMutation.mutate({ duration: seconds, subject: selectedSubject });
      setSeconds(0);
      setIsRunning(false);
    }
  }, [seconds, saveMutation, selectedSubject]);

  const startPomodoro = useCallback(() => {
    bellSound.initialize();
    setPomodoroRunning(true);
  }, []);
  const pausePomodoro = useCallback(() => setPomodoroRunning(false), []);
  const resetPomodoro = useCallback(() => {
    setPomodoroSeconds(pomodoroMinutes * 60);
    setPomodoroRunning(false);
    setPomodoroCompleted(false);
    setPomodoroElapsed(0);
  }, [pomodoroMinutes]);
  const savePomodoro = useCallback(() => {
    if (pomodoroElapsed > 0 && !saveMutation.isPending) {
      saveMutation.mutate({ duration: pomodoroElapsed, subject: selectedSubject });
      setPomodoroSeconds(pomodoroMinutes * 60);
      setPomodoroRunning(false);
      setPomodoroCompleted(false);
      setPomodoroElapsed(0);
    }
  }, [pomodoroElapsed, saveMutation, selectedSubject, pomodoroMinutes]);

  const setPomodoroMinutes = useCallback((minutes: number) => {
    setPomodoroMinutesState(minutes);
    setPomodoroSeconds(minutes * 60);
    setPomodoroElapsed(0);
    setPomodoroCompleted(false);
  }, []);

  return (
    <TimerContext.Provider
      value={{
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
        isSaving: saveMutation.isPending,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
