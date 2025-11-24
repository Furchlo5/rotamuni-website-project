import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { QuestionCount } from "@shared/schema";

export default function CounterPage() {
  const today = new Date().toISOString().split("T")[0];
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [showKeypad, setShowKeypad] = useState(false);

  const { data: counts = [], isLoading } = useQuery<QuestionCount[]>({
    queryKey: ["/api/question-counts", today],
  });

  const updateMutation = useMutation({
    mutationFn: ({ subject, count }: { subject: string; count: number }) =>
      apiRequest("POST", "/api/question-counts", {
        subject,
        count: Math.max(0, count),
        date: today,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/question-counts", today] });
      setInputValue("");
      setShowKeypad(false);
      toast({
        title: "Saved!",
        description: "Question count updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error!",
        description: "Could not update question count.",
        variant: "destructive",
      });
    },
  });

  const dailyTotalCount = counts.find((c) => c.subject === "Daily Total");
  const totalQuestions = dailyTotalCount ? dailyTotalCount.count : 0;

  const handleSave = () => {
    const count = parseInt(inputValue);
    if (!isNaN(count) && count >= 0) {
      updateMutation.mutate({ subject: "Daily Total", count });
    } else {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number.",
        variant: "destructive",
      });
    }
  };

  const handleKeypadClick = (value: string) => {
    if (value === "clear") {
      setInputValue("");
    } else if (value === "backspace") {
      setInputValue((prev) => prev.slice(0, -1));
    } else {
      setInputValue((prev) => prev + value);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] p-0">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f2744] px-4 py-6 shadow-xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white" data-testid="text-page-title">
                Daily Tracker
              </h1>
            </div>
          </div>
          
          {/* Stats Summary */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-center">
              <div className="text-sm text-white/60 mb-1">Today's Total</div>

              {/* burada className rengi turkuaz yapıldı... */}
              <div className="text-4xl font-bold text-[#14b8a6]" data-testid="text-total-count">
                {isLoading ? "..." : totalQuestions}
              </div>
              <div className="text-xs text-white/50 mt-1">questions solved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        <Card className="bg-[#152238] border-[#1e3a5f] shadow-2xl overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              Daily Question Tracker
            </h2>
            <p className="text-sm text-white/50 mb-6">
              Enter the number of questions you've solved today
            </p>
            
            {/* Input Field - burada focus:border ve focus:ring turkuaz yapıldı */}
            <div className="mb-6">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter count..."
                value={inputValue}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setInputValue(value);
                }}
                onFocus={() => setShowKeypad(true)}
                className="h-16 text-center text-3xl font-bold bg-[#0a1628] border-[#2d4a6f] text-white placeholder:text-white/30 focus:border-[#14b8a6] focus:ring-[#14b8a6]/20"
                data-testid="input-question-count"
              />
            </div>

            {/* Save Button - Burada from, to, hover:from, hover:to degistirildi */}
            <Button
              onClick={handleSave}
              disabled={!inputValue || updateMutation.isPending}
              className="w-full h-14 bg-gradient-to-r from-[#14b8a6] to-[#0891b2] hover:from-[#2dd4bf] hover:to-[#06b6d4] text-white font-semibold text-lg shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-save"
            >
              <Check className="w-5 h-5 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Count"}
            </Button>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Last updated</span>
                <span className="text-white/80 font-medium">Today</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white/40">
            Tap the input field to enter your daily question count
          </p>
        </div>
      </div>

      {/* Numeric Keypad Overlay */}
      {showKeypad && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end animate-in fade-in duration-200"
          onClick={() => setShowKeypad(false)}
          data-testid="keypad-overlay"
        >
          <div 
            className="w-full bg-[#152238] border-t border-[#2d4a6f] p-4 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-md mx-auto">
              {/* Keypad Header */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-white/60 text-sm">Enter count</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeypad(false)}
                  className="text-white/60 hover:text-white"
                >
                  Done
                </Button>
              </div>

              {/* Display */}
              <div className="bg-[#0a1628] rounded-xl p-4 mb-4 border border-[#2d4a6f]">
                <div className="text-right text-3xl font-bold text-white min-h-[48px] flex items-center justify-end">
                  {inputValue || "0"}
                </div>
              </div>

              {/* Number Grid */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeypadClick(num.toString())}
                    className="h-14 bg-[#1e3a5f] hover:bg-[#2d4a6f] active:bg-[#3d5a7f] text-white text-xl font-semibold rounded-xl transition-colors"
                    data-testid={`keypad-${num}`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleKeypadClick("clear")}
                  className="h-14 bg-[#1e3a5f] hover:bg-[#2d4a6f] active:bg-[#3d5a7f] text-white/70 text-sm font-medium rounded-xl transition-colors"
                  data-testid="keypad-clear"
                >
                  Clear
                </button>
                <button
                  onClick={() => handleKeypadClick("0")}
                  className="h-14 bg-[#1e3a5f] hover:bg-[#2d4a6f] active:bg-[#3d5a7f] text-white text-xl font-semibold rounded-xl transition-colors"
                  data-testid="keypad-0"
                >
                  0
                </button>
                <button
                  onClick={() => handleKeypadClick("backspace")}
                  className="h-14 bg-[#1e3a5f] hover:bg-[#2d4a6f] active:bg-[#3d5a7f] text-white/70 text-sm font-medium rounded-xl transition-colors"
                  data-testid="keypad-backspace"
                >
                  ⌫
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
