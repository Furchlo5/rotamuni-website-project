import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardList, Calculator, Clock, BarChart, Flame, Target, ChevronRight } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

const features = [
  {
    title: "To-Do List",
    description: "Günlük hedeflerinizi belirleyin ve takip edin",
    path: "/todo",
    icon: ClipboardList,
  },
  {
    title: "Soru Sayısı Takibi",
    description: "Ders ders çözdüğünüz soruları kaydedin",
    path: "/counter",
    icon: Calculator,
  },
  {
    title: "Zamanlayıcı",
    description: "Çalışma sürenizi ölçün ve kaydedin",
    path: "/timer",
    icon: Clock,
  },
  {
    title: "Analiz",
    description: "İlerlemenizi grafiklerle görselleştirin",
    path: "/analysis",
    icon: BarChart,
  },
  {
    title: "Streak",
    description: "Günlük çalışma serinizi takip edin",
    path: "/streak",
    icon: Flame,
  },
  {
    title: "Net Takibi",
    description: "TYT ve AYT netlerinizi hesaplayın",
    path: "/net-tracking",
    icon: Target,
  },
];

export default function Dashboard() {
  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      return apiRequest("PATCH", `/api/todos/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
  });

  const incompleteTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  const handleToggle = (id: string, currentCompleted: boolean) => {
    updateTodoMutation.mutate({ id, completed: !currentCompleted });
  };

  return (
    <div className="min-h-screen bg-[#0a1628] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Today's Tasks Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[#14b8a6]" />
              Bugünkü Görevlerin
            </h2>
            <Link href="/todo">
              <span className="text-[#14b8a6] text-sm flex items-center gap-1 hover:underline cursor-pointer">
                Tümünü Gör
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
          
          <Card className="bg-[#152238] border-[#1e3a5f] p-4">
            {isLoading ? (
              <div className="text-white/60 text-center py-4">Yükleniyor...</div>
            ) : todos.length === 0 ? (
              <div className="text-white/60 text-center py-4">
                Henüz görev eklenmemiş.{" "}
                <Link href="/todo">
                  <span className="text-[#14b8a6] hover:underline cursor-pointer">
                    Görev ekle
                  </span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Incomplete todos first */}
                {incompleteTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1e3a5f]/50 transition-colors"
                  >
                    <Checkbox
                      id={`todo-${todo.id}`}
                      checked={todo.completed}
                      onCheckedChange={() => handleToggle(todo.id, todo.completed)}
                      className="border-[#14b8a6] data-[state=checked]:bg-[#14b8a6] data-[state=checked]:border-[#14b8a6]"
                    />
                    <label
                      htmlFor={`todo-${todo.id}`}
                      className="text-white cursor-pointer flex-1"
                    >
                      {todo.title}
                    </label>
                  </div>
                ))}
                
                {/* Completed todos */}
                {completedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1e3a5f]/50 transition-colors opacity-60"
                  >
                    <Checkbox
                      id={`todo-${todo.id}`}
                      checked={todo.completed}
                      onCheckedChange={() => handleToggle(todo.id, todo.completed)}
                      className="border-[#14b8a6] data-[state=checked]:bg-[#14b8a6] data-[state=checked]:border-[#14b8a6]"
                    />
                    <label
                      htmlFor={`todo-${todo.id}`}
                      className="text-white cursor-pointer flex-1 line-through"
                    >
                      {todo.title}
                    </label>
                  </div>
                ))}
                
                {/* Summary */}
                {todos.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-[#1e3a5f] text-white/60 text-sm">
                    {completedTodos.length} / {todos.length} görev tamamlandı
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Features Section */}
        <h2 className="text-3xl font-bold text-white text-center mb-12" data-testid="text-features-title">
          Özellikler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.path} href={feature.path}>
              <Card 
                className="bg-[#152238] border-[#1e3a5f] p-6 hover:border-[#14b8a6] transition-all cursor-pointer h-full"
                data-testid={`card-feature-${feature.path.substring(1)}`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-[#14b8a6]/20 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-[#14b8a6]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
