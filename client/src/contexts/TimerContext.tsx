import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
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

const ALARM_SOUND_URL = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onq2rp5yCZU9CQT5KTGN4kKq2tqugjnNYQzQvMTxOZoCcsLu1qZR7XEEvJScsO1FujKe5vbKciW1TPTE0Ok5niJ6xvLapk3xgRzY0Nk1gjJ+xurGlkHtiSTo3O0xgjKCyu7OmlX1iSTw8QE9kkaO0u7OnlYBmTkJESFdsk6a3vLWonYhyXU1GTFdok6S0urKnloNsTEVLV2eRorW4saeYiG5ZTEpUY42fsbezqJmKcV1STFNhj5+wtbKpmox1X1RRV2SSobKzsKeZi3JbUk9WYI+fsLOyqJmMc11UUldijp6vsrGomot0XlRTV2GPn6+ysKiZjHReVFRYYo6er7GvqJmLdF5VVVlij56usK+omYx0XlVVWWKOnq6wr6eZjHVfVlZaYo6errCup5mMdV9WVlpijp6usK6nmYx1X1ZWWmKOnq6wrqeZjHVfVlZaYo6errCup5mMdV9WVlpijp6usK6nmYx1X1ZWWmKOnq6wrqeZjHVfVlZaYo6errCup5mMdV9WVlpijp6usK6nmYx1X1ZWWmKOnq6wrqeZjHVfVlZaYo6errCup5mMdV9WVlpijp6usK6nmYx1YFdXW2OPn66wr6iajXZgV1dbY4+frrCvqJqNdmBXV1xkj5+vsLComY12YFhYXGSPn6+wsKiZjXZgWFhcZI+fr7CwqJmNdmBYWFxkj5+vsLComY12YFhYXGSPn6+wsKiZjXZgWFhcZI+fr7CwqJmNdmBYWFxkj5+vsLComY12YFhYXGSPn6+wsKiZjXZgWFhcZI+fr7CwqJmNdmBYWF1lkKCwsbGpmY53YVlZXWWQoLCxsamZj3dhWVldZZCgsLGxqZmPd2FZWl5mkaCxsrKqmpB4YlpaXmaRobGysqqakHhiWlpeZpGhsbKyqpqQeGJaWl5mkaCxsrKqmpB4YlpaXmaRobGysqqakHhiWlpeZpGhsbKyqpqQeGJbW19nkqKys7OrnJF5Y1tcYGeRobKzsquakXljW1xgZ5KisrSzq5uReWNbXGBnkqKytLSsnJJ6ZFxdYWiSorK0tKyckntlXV5iaZOjs7W1rZ2Te2VdXmJpk6OztbWtnZN7ZV1eYmmTo7O1ta2dk3tlXV5iaZOjs7W1rZ2Te2VdXmJpk6OztbWtnZN7ZV1eYmmTo7O1ta2dk3tlXV5iaZOjs7W1rZ2Te2VdXmJpk6OztbWtnZN7ZV5fY2qUpLS2trCfln1nX2BkalSktLa2sJ+WfWdfYGRqk6S0tra0oJd+aGBhZWuUpba3t7Wgl35oYGFla5Sltbe3taGXfmhhYmZslaa3uLi2opiBamJjaGyVpri4uLeimIFqYmNobJWmuLi4t6KYgWpiY2hslaa4uLi3opmCalJjY2htlqa4ubm4o5qCa2NkZ26Wprm5ubiimpZ/ZmFlZ3CXqLq6urekmX9mYWVncJeouru7uqadiHhmYmVocZiquby8vKqlnop7aGVobXWaqrq8vLutop2Nf2xoa3B5nay9v8C/saeginVubHF1fJ+yvsDDwrmvoYqBd3Jzd3qao7W+wMC7sp2MhX53dHd5mqW4wcLBvrOemouCfXl4eJqluMPExMK5op2Lh4B9fHybqLrFxsbFvqefj42FgoB+oKy+yMnJyMGspJGPiIWDgaKuwMnKy8vDraWSko6KhoSjsMHLzc3Nxq+olZWRjIiFpbLCzM7Oz8ixqZeXk4+LiKe0xM/R0dHLtKyamZWRjYqpt8bR09PU0Le9paqpqamwt77I0dTV1c+6wLKxs7a4vcPI0tTW1tLBycC6vcDBxMnO09XX2NXMzsjDwcLCw8fM0dXX2NjW0M/Lx8XFxsfK0NTV19fY1tLQzczKysrMztLV19fY19XT0c/Nzc3Oz9LW2NnZ2djX1tTS0dDQ0NLU1tnZ2dnZ2djX1tXU09PU1dbZ2drZ2NnZ2djX1tXV1dXW19na2trZ2NjY2NjX1tbW1tbY2dra2tra2NjY2NjX1tbW1tbY2dra2tra2NjY2NjX19fX19jZ2tra2tra2djY2NjX19fX19jZ2tra2tra2djY2NjY2NjY2NjZ2tra2tra2dnY2NjY2NjY2NjZ2tra2tra2dnZ2djY2NjY2djZ2tra2tra2tnZ2djY2NjY2djZ2tra2trZ2dnZ2dnY2A==";

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

  const playAlarm = useCallback(() => {
    const audio = new Audio(ALARM_SOUND_URL);
    audio.volume = 0.7;
    audio.play().catch(() => {});
    
    setTimeout(() => {
      audio.play().catch(() => {});
    }, 500);
    setTimeout(() => {
      audio.play().catch(() => {});
    }, 1000);
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

  const startPomodoro = useCallback(() => setPomodoroRunning(true), []);
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
