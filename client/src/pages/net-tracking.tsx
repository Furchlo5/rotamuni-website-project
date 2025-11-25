import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Calculator, BookOpen, GraduationCap, Save } from "lucide-react";

type ExamType = "TYT" | "AYT" | null;
type AYTField = "sozel" | "esit" | "sayisal" | null;

interface SubjectScore {
  correct: number;
  wrong: number;
  blank: number;
}

interface Subject {
  name: string;
  maxQuestions: number;
}

const TYT_SUBJECTS: Subject[] = [
  { name: "Türkçe", maxQuestions: 40 },
  { name: "Tarih", maxQuestions: 5 },
  { name: "Coğrafya", maxQuestions: 5 },
  { name: "Felsefe", maxQuestions: 5 },
  { name: "Din Kültürü", maxQuestions: 5 },
  { name: "Matematik", maxQuestions: 30 },
  { name: "Geometri", maxQuestions: 10 },
  { name: "Fizik", maxQuestions: 7 },
  { name: "Kimya", maxQuestions: 7 },
  { name: "Biyoloji", maxQuestions: 6 },
];

const AYT_SOZEL_SUBJECTS: Subject[] = [
  { name: "Edebiyat", maxQuestions: 40 },
  { name: "Tarih", maxQuestions: 11 },
  { name: "Coğrafya", maxQuestions: 11 },
  { name: "Diğer", maxQuestions: 18 },
];

const AYT_ESIT_SUBJECTS: Subject[] = [
  { name: "Edebiyat", maxQuestions: 40 },
  { name: "Matematik", maxQuestions: 40 },
];

const AYT_SAYISAL_SUBJECTS: Subject[] = [
  { name: "Matematik", maxQuestions: 40 },
  { name: "Fizik", maxQuestions: 14 },
  { name: "Kimya", maxQuestions: 13 },
  { name: "Biyoloji", maxQuestions: 13 },
];

function getInitialScores(subjects: Subject[]): Record<string, SubjectScore> {
  const scores: Record<string, SubjectScore> = {};
  subjects.forEach((subject) => {
    scores[subject.name] = { correct: 0, wrong: 0, blank: subject.maxQuestions };
  });
  return scores;
}

function calculateNet(score: SubjectScore): number {
  return score.correct - score.wrong * 0.25;
}

function calculateTotalNet(scores: Record<string, SubjectScore>): number {
  return Object.values(scores).reduce((total, score) => total + calculateNet(score), 0);
}

export default function NetTrackingPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [examType, setExamType] = useState<ExamType>(null);
  const [aytField, setAytField] = useState<AYTField>(null);
  const [tytScores, setTytScores] = useState<Record<string, SubjectScore>>(
    getInitialScores(TYT_SUBJECTS)
  );
  const [aytScores, setAytScores] = useState<Record<string, SubjectScore>>({});
  const [examDate, setExamDate] = useState(new Date().toISOString().split("T")[0]);
  const [publisher, setPublisher] = useState("");

  const saveMutation = useMutation({
    mutationFn: async (data: {
      examType: string;
      aytField: string | null;
      date: string;
      publisher: string;
      totalNet: string;
      subjectScores: Record<string, { correct: number; wrong: number; net: number }>;
    }) => {
      return apiRequest("POST", "/api/net-results", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/net-results"] });
      toast({
        title: "Kaydedildi!",
        description: "Deneme sonucu başarıyla kaydedildi.",
      });
      setExamType(null);
      setAytField(null);
      setTytScores(getInitialScores(TYT_SUBJECTS));
      setAytScores({});
      setPublisher("");
      setExamDate(new Date().toISOString().split("T")[0]);
    },
    onError: () => {
      toast({
        title: "Hata!",
        description: "Deneme sonucu kaydedilemedi.",
        variant: "destructive",
      });
    },
  });

  const handleExamTypeChange = (type: ExamType) => {
    setExamType(type);
    if (type === "TYT") {
      setAytField(null);
      setTytScores(getInitialScores(TYT_SUBJECTS));
    } else if (type === "AYT") {
      setAytField(null);
      setAytScores({});
    }
  };

  const handleAytFieldChange = (field: AYTField) => {
    setAytField(field);
    if (field === "sozel") {
      setAytScores(getInitialScores(AYT_SOZEL_SUBJECTS));
    } else if (field === "esit") {
      setAytScores(getInitialScores(AYT_ESIT_SUBJECTS));
    } else if (field === "sayisal") {
      setAytScores(getInitialScores(AYT_SAYISAL_SUBJECTS));
    }
  };

  const updateScore = (
    subjectName: string,
    field: "correct" | "wrong" | "blank",
    value: number,
    maxQuestions: number,
    isTyt: boolean
  ) => {
    const setScores = isTyt ? setTytScores : setAytScores;
    
    setScores((prev) => {
      const current = prev[subjectName];
      const newScore = { ...current, [field]: value };
      
      const totalUsed = newScore.correct + newScore.wrong + newScore.blank;
      if (totalUsed !== maxQuestions) {
        newScore.blank = maxQuestions - newScore.correct - newScore.wrong;
        if (newScore.blank < 0) {
          newScore.blank = 0;
          if (newScore.correct + newScore.wrong > maxQuestions) {
            if (field === "correct") {
              newScore.wrong = maxQuestions - newScore.correct;
            } else {
              newScore.correct = maxQuestions - newScore.wrong;
            }
          }
        }
      }
      
      return { ...prev, [subjectName]: newScore };
    });
  };

  const handleInputChange = (
    subjectName: string,
    field: "correct" | "wrong" | "blank",
    inputValue: string,
    maxQuestions: number,
    isTyt: boolean
  ) => {
    const value = inputValue === "" ? 0 : parseInt(inputValue, 10);
    if (isNaN(value) || value < 0) return;
    if (value > maxQuestions) return;
    
    updateScore(subjectName, field, value, maxQuestions, isTyt);
  };

  const getCurrentSubjects = (): Subject[] => {
    if (examType === "TYT") return TYT_SUBJECTS;
    if (examType === "AYT") {
      if (aytField === "sozel") return AYT_SOZEL_SUBJECTS;
      if (aytField === "esit") return AYT_ESIT_SUBJECTS;
      if (aytField === "sayisal") return AYT_SAYISAL_SUBJECTS;
    }
    return [];
  };

  const getCurrentScores = (): Record<string, SubjectScore> => {
    if (examType === "TYT") return tytScores;
    return aytScores;
  };

  const handleSave = () => {
    if (!examType) {
      toast({
        title: "Hata!",
        description: "Lütfen sınav türünü seçin.",
        variant: "destructive",
      });
      return;
    }

    if (examType === "AYT" && !aytField) {
      toast({
        title: "Hata!",
        description: "Lütfen alan seçin.",
        variant: "destructive",
      });
      return;
    }

    if (!publisher.trim()) {
      toast({
        title: "Hata!",
        description: "Lütfen yayın adı girin.",
        variant: "destructive",
      });
      return;
    }

    const scores = getCurrentScores();
    const subjectScores: Record<string, { correct: number; wrong: number; net: number }> = {};
    
    Object.entries(scores).forEach(([name, score]) => {
      subjectScores[name] = {
        correct: score.correct,
        wrong: score.wrong,
        net: calculateNet(score),
      };
    });

    saveMutation.mutate({
      examType: examType,
      aytField: aytField,
      date: examDate,
      publisher: publisher.trim(),
      totalNet: totalNet.toFixed(2),
      subjectScores,
    });
  };

  const subjects = getCurrentSubjects();
  const scores = getCurrentScores();
  const totalNet = calculateTotalNet(scores);
  const totalQuestions = subjects.reduce((sum, s) => sum + s.maxQuestions, 0);
  const isExamTypeValid = examType !== null && (examType === "TYT" || (examType === "AYT" && aytField !== null));
  const canSave = isExamTypeValid && subjects.length > 0 && publisher.trim() !== "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Sayfa
        </Button>

        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <Calculator className="w-6 h-6 text-teal-600" />
              Net Takibi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="inline-flex rounded-full bg-gray-100 dark:bg-gray-700 p-1">
                <Button
                  variant="ghost"
                  onClick={() => handleExamTypeChange("TYT")}
                  className={`rounded-full px-8 py-2 text-sm font-medium transition-all ${
                    examType === "TYT"
                      ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:text-teal-600"
                  }`}
                >
                  TYT
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleExamTypeChange("AYT")}
                  className={`rounded-full px-8 py-2 text-sm font-medium transition-all ${
                    examType === "AYT"
                      ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:text-teal-600"
                  }`}
                >
                  AYT
                </Button>
              </div>
            </div>

            {examType === "AYT" && (
              <div className="flex justify-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAytFieldChange("sozel")}
                  className={`${
                    aytField === "sozel"
                      ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-0"
                      : "border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400"
                  }`}
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  Sözel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAytFieldChange("esit")}
                  className={`${
                    aytField === "esit"
                      ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-0"
                      : "border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400"
                  }`}
                >
                  <GraduationCap className="w-4 h-4 mr-1" />
                  Eşit Ağırlık
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAytFieldChange("sayisal")}
                  className={`${
                    aytField === "sayisal"
                      ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-0"
                      : "border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400"
                  }`}
                >
                  <Calculator className="w-4 h-4 mr-1" />
                  Sayısal
                </Button>
              </div>
            )}

            {subjects.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="examDate" className="text-sm font-medium">
                      Deneme Tarihi
                    </Label>
                    <Input
                      id="examDate"
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publisher" className="text-sm font-medium">
                      Yayın Adı
                    </Label>
                    <Input
                      id="publisher"
                      type="text"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="Örn: 3D, Limit, Palme..."
                      className="bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground text-center mb-2">
                  <div>Ders</div>
                  <div>Doğru</div>
                  <div>Yanlış</div>
                  <div>Net</div>
                </div>

                <div className="space-y-3">
                  {subjects.map((subject) => {
                    const score = scores[subject.name];
                    const net = calculateNet(score);
                    const isTyt = examType === "TYT";

                    return (
                      <div
                        key={subject.name}
                        className="grid grid-cols-4 gap-2 items-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2"
                      >
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {subject.name}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({subject.maxQuestions})
                          </span>
                        </div>
                        <Input
                          type="number"
                          min={0}
                          max={subject.maxQuestions}
                          value={score.correct || ""}
                          onChange={(e) =>
                            handleInputChange(
                              subject.name,
                              "correct",
                              e.target.value,
                              subject.maxQuestions,
                              isTyt
                            )
                          }
                          className="h-8 text-center text-sm bg-white dark:bg-gray-800"
                          placeholder="0"
                        />
                        <Input
                          type="number"
                          min={0}
                          max={subject.maxQuestions}
                          value={score.wrong || ""}
                          onChange={(e) =>
                            handleInputChange(
                              subject.name,
                              "wrong",
                              e.target.value,
                              subject.maxQuestions,
                              isTyt
                            )
                          }
                          className="h-8 text-center text-sm bg-white dark:bg-gray-800"
                          placeholder="0"
                        />
                        <div
                          className={`text-sm font-bold text-center ${
                            net >= 0 ? "text-teal-600 dark:text-teal-400" : "text-red-500"
                          }`}
                        >
                          {net.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm opacity-90">Toplam Net</div>
                      <div className="text-3xl font-bold">{totalNet.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-90">Toplam Soru</div>
                      <div className="text-xl font-semibold">{totalQuestions}</div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={!canSave || saveMutation.isPending}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveMutation.isPending ? "Kaydediliyor..." : "Denemeyi Kaydet"}
                </Button>
              </>
            )}

            {examType === null && (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Sınav türünü seçerek net hesaplamaya başlayın</p>
              </div>
            )}

            {examType === "AYT" && aytField === null && (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Alan seçerek devam edin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
