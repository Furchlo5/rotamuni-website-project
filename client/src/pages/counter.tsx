import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Plus, Minus, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { QuestionCount } from "@shared/schema";

const subjects = [
  { name: "Türkçe", color: "from-red-200 to-red-300" },
  { name: "Matematik", color: "from-blue-200 to-blue-300" },
  { name: "Fen Bilimleri", color: "from-green-200 to-green-300" },
  { name: "Sosyal Bilimler", color: "from-yellow-200 to-yellow-300" },
  { name: "Tarih", color: "from-purple-200 to-purple-300" },
  { name: "Coğrafya", color: "from-teal-200 to-teal-300" },
  { name: "Felsefe", color: "from-orange-200 to-orange-300" },
  { name: "Din Kültürü", color: "from-pink-200 to-pink-300" },
];

export default function CounterPage() {
  const today = new Date().toISOString().split("T")[0];

  const { data: counts = [], isLoading } = useQuery<QuestionCount[]>({
    queryKey: ["/api/question-counts", today],
  });

  const updateMutation = useMutation({
    mutationFn: ({ subject, count }: { subject: string; count: number }) =>
      apiRequest("POST", "/api/question-counts", {
        subject,
        count,
        date: today,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/question-counts", today] });
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
                Soru Sayacı
              </h1>
              <p className="text-blue-50 text-sm mt-1">
                Bugün toplam: {totalQuestions} soru
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <Card className="p-4">
            <p className="text-center text-muted-foreground">Yükleniyor...</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject) => {
              const count = getCount(subject.name);
              return (
                <Card
                  key={subject.name}
                  className="overflow-hidden"
                  data-testid={`card-subject-${subject.name}`}
                >
                  <div className={`bg-gradient-to-br ${subject.color} p-4`}>
                    <h3 className="font-semibold text-gray-800 text-center text-lg">
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
