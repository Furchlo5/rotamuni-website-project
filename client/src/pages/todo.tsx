import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Todo } from "@shared/schema";

export default function TodoPage() {
  const [newTodo, setNewTodo] = useState("");
  const { toast } = useToast();

  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  const addMutation = useMutation({
    mutationFn: (title: string) =>
      apiRequest("POST", "/api/todos", { title, completed: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setNewTodo("");
      toast({
        title: "Görev eklendi!",
        description: "Yeni göreviniz listeye eklendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata!",
        description: "Görev eklenemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      apiRequest("PATCH", `/api/todos/${id}`, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
    onError: () => {
      toast({
        title: "Hata!",
        description: "Görev güncellenemedi.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/todos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Görev silindi",
        description: "Görev listeden kaldırıldı.",
      });
    },
    onError: () => {
      toast({
        title: "Hata!",
        description: "Görev silinemedi.",
        variant: "destructive",
      });
    },
  });

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addMutation.mutate(newTodo.trim());
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;

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
                To-Do List
              </h1>
              <p className="text-white/90 text-sm mt-1">
                {completedCount} / {todos.length} görev tamamlandı
              </p>
            </div>
          </div>
        </div>

        <Card className="p-4 mb-4 shadow-md">
          <div className="flex gap-2">
            <Input
              placeholder="Yeni görev ekle..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
              className="flex-1"
              data-testid="input-new-todo"
            />
            <Button
              onClick={handleAddTodo}
              disabled={!newTodo.trim() || addMutation.isPending}
              className="bg-gradient-to-r from-[#14b8a6] to-[#0891b2] hover:from-[#2dd4bf] hover:to-[#06b6d4] text-white"
              data-testid="button-add-todo"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        <div className="space-y-3">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1 h-5 bg-muted rounded animate-pulse" />
                    <div className="w-9 h-9 bg-muted rounded animate-pulse" />
                  </div>
                </Card>
              ))}
            </>
          ) : todos.length === 0 ? (
            <Card className="p-8 shadow-md">
              <div className="text-center">
                <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Henüz görev eklenmemiş. Yukarıdan yeni görev ekleyebilirsin!
                </p>
              </div>
            </Card>
          ) : (
            todos.map((todo) => (
              <Card
                key={todo.id}
                className="p-4 shadow-md transition-all hover:shadow-lg"
                data-testid={`todo-item-${todo.id}`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      toggleMutation.mutate({
                        id: todo.id,
                        completed: !todo.completed,
                      })
                    }
                    className="flex-shrink-0"
                    data-testid={`button-toggle-${todo.id}`}
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  <span
                    className={`flex-1 ${
                      todo.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                    data-testid={`text-todo-title-${todo.id}`}
                  >
                    {todo.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(todo.id)}
                    className="flex-shrink-0 text-destructive hover:bg-destructive/10"
                    data-testid={`button-delete-${todo.id}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
