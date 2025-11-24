import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Plus, Minus, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { QuestionCount } from "@shared/schema";

const subjects = [
  { name: "Türkçe", color: "from-orange-500 to-amber-600" },
  { name: "Matematik", color: "from-teal-500 to-cyan-600" },
  { name: "Fen Bilimleri", color: "from-cyan-500 to-teal-600" },
  { name: "Sosyal Bilimler", color: "from-amber-500 to-orange-600" },
  { name: "Tarih", color: "from-orange-600 to-amber-700" },
  { name: "Coğrafya", color: "from-teal-600 to-cyan-700" },
  { name: "Felsefe", color: "from-amber-600 to-orange-700" },
  { name: "Din Kültürü", color: "from-cyan-600 to-teal-700" },
];

export default function CounterPage() {
  const today = new Date().toISOString().split("T")[0];
  const { toast } = useToast();

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
    },
    onError: () => {
      toast({
        title: "Hata!",
        description: "Soru sayısı güncellenemedi.",
        variant: "destructive",
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: (subject: string) =>
      apiRequest("POST", "/api/question-counts", {
        subject,
        count: 0,
        date: today,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/question-counts", today] });
    },
    onError: () => {
      toast({
        title: "Hata!",
        description: "Soru sayısı sıfırlanamadı.",
        variant: "destructive",
      });
    },
  });

  const getCount = (subject: string) => {
    const found = counts.find((c) => c.subject === subject);
    return found ? found.count : 0;
  };

  const handleIncrement = (subject: string) => {
    const current = getCount(subject);
    updateMutation.mutate({ subject, count: current + 1 });
  };

  const handleDecrement = (subject: string) => {
    const current = getCount(subject);
    if (current > 0) {
      updateMutation.mutate({ subject, count: current - 1 });
    }
  };

  const totalQuestions = counts.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
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
                Soru Sayacı
              </h1>
              <p className="text-white/90 text-sm mt-1">
                Bugün toplam: {totalQuestions} soru
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden shadow-md">
                <div className="bg-muted h-16 animate-pulse" />
                <div className="p-4 space-y-4">
                  <div className="h-12 bg-muted rounded animate-pulse mx-auto w-24" />
                  <div className="h-10 bg-muted rounded animate-pulse" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject) => {
              const count = getCount(subject.name);
              return (
                <Card
                  key={subject.name}
                  className="overflow-hidden shadow-md"
                  data-testid={`card-subject-${subject.name}`}
                >
                  <div className={`bg-gradient-to-br ${subject.color} p-4`}>
                    <h3 className="font-semibold text-white text-center text-lg">
                      {subject.name}
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <div
                        className="text-4xl font-bold text-foreground"
                        data-testid={`text-count-${subject.name}`}
                      >
                        {count}
                      </div>
                      <div className="text-sm text-muted-foreground">soru</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDecrement(subject.name)}
                        disabled={count === 0 || updateMutation.isPending}
                        className="flex-1"
                        data-testid={`button-decrement-${subject.name}`}
                      >
                        <Minus className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={() => handleIncrement(subject.name)}
                        disabled={updateMutation.isPending}
                        className="flex-1"
                        data-testid={`button-increment-${subject.name}`}
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => resetMutation.mutate(subject.name)}
                        disabled={count === 0 || resetMutation.isPending}
                        data-testid={`button-reset-${subject.name}`}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
