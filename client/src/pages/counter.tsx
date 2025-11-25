import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Plus, X, Check } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { QuestionCount } from "@shared/schema";

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

export default function CounterPage() {
  const today = new Date().toISOString().split("T")[0];
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [customSubjects, setCustomSubjects] = useState<string[]>(getCustomSubjects());
  const [newSubjectName, setNewSubjectName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const allSubjects = [...defaultSubjects, ...customSubjects];
  const [selectedSubject, setSelectedSubject] = useState(allSubjects[0]);

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
      toast({
        title: "Kaydedildi!",
        description: `${selectedSubject} için soru sayısı güncellendi.`,
      });
    },
    onError: () => {
      toast({
        title: "Hata!",
        description: "Soru sayısı kaydedilemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    },
  });

  const totalQuestions = counts.reduce((sum, c) => sum + c.count, 0);
  
  const currentSubjectCount = counts.find((c) => c.subject === selectedSubject)?.count || 0;

  const handleSave = () => {
    const count = parseInt(inputValue);
    if (!isNaN(count) && count >= 0) {
      updateMutation.mutate({ subject: selectedSubject, count });
    } else {
      toast({
        title: "Geçersiz değer",
        description: "Lütfen geçerli bir sayı girin.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCount = (amount: number) => {
    const newCount = currentSubjectCount + amount;
    if (newCount >= 0) {
      updateMutation.mutate({ subject: selectedSubject, count: newCount });
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

  const subjectCounts = counts.filter((c) => c.count > 0);

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
                Soru Sayısı Takibi
              </h1>
              <p className="text-white/90 text-sm mt-1">
                {isLoading ? (
                  <span className="inline-block w-32 h-4 bg-white/20 rounded animate-pulse" />
                ) : (
                  `Bugün toplam: ${totalQuestions} soru`
                )}
              </p>
            </div>
          </div>
        </div>

        <Card className="p-6 md:p-8 mb-6 shadow-md">
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Ders Seçin
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
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
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

          <div className="text-center mb-6">
            <div className="text-sm text-muted-foreground mb-2">
              {selectedSubject} için bugün
            </div>
            <div
              className="text-6xl md:text-7xl font-bold text-foreground mb-2 font-mono"
              data-testid="text-subject-count"
            >
              {isLoading ? "..." : currentSubjectCount}
            </div>
            <div className="text-sm text-muted-foreground">soru çözüldü</div>
          </div>

          <div className="flex gap-2 justify-center mb-6 flex-wrap">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAddToCount(1)}
              disabled={updateMutation.isPending}
              className="border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-950 text-lg font-semibold"
            >
              +1
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAddToCount(5)}
              disabled={updateMutation.isPending}
              className="border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-950 text-lg font-semibold"
            >
              +5
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAddToCount(10)}
              disabled={updateMutation.isPending}
              className="border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-950 text-lg font-semibold"
            >
              +10
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAddToCount(20)}
              disabled={updateMutation.isPending}
              className="border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-950 text-lg font-semibold"
            >
              +20
            </Button>
          </div>

          <div className="border-t pt-6">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Veya manuel girin
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Soru sayısı..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
                min={0}
                data-testid="input-question-count"
              />
              <Button
                onClick={handleSave}
                disabled={!inputValue || updateMutation.isPending}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                data-testid="button-save"
              >
                <Check className="w-5 h-5 mr-2" />
                Kaydet
              </Button>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <Card className="p-4 shadow-md">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-2"
                >
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </Card>
        ) : subjectCounts.length > 0 ? (
          <Card className="p-4 shadow-md">
            <h3 className="font-semibold mb-3">Bugünkü Soru Dağılımı</h3>
            <div className="space-y-2">
              {subjectCounts.map((count) => (
                <div
                  key={count.id}
                  className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded"
                  data-testid={`count-${count.subject}`}
                >
                  <span className="font-medium">{count.subject}</span>
                  <span className="text-muted-foreground font-mono">
                    {count.count} soru
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center font-semibold">
              <span>Toplam</span>
              <span className="text-teal-600 dark:text-teal-400 font-mono">
                {totalQuestions} soru
              </span>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
