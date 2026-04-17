import { Card, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import {
  Brain,
  BookOpen,
  CheckCircle2,
  Award,
  Bell,
  Network,
  BarChart3,
  FileText,
  Users,
  Clock,
  MessageSquare,
  Target,
} from "lucide-react";

export default function FeaturesSection() {
  return (
    <section id="caracteristicas" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
            Características
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Herramientas pensadas para ti</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Cada función está diseñada para resolver problemas reales de estudiantes y docentes
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
            <CardHeader>
              <Brain className="w-10 h-10 text-primary mb-3" />
              <CardTitle className="text-base">IA que crea tareas y eventos</CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
            <CardHeader>
              <BookOpen className="w-10 h-10 text-primary mb-3" />
              <CardTitle className="text-base">Gestión completa de cursos</CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
            <CardHeader>
              <CheckCircle2 className="w-10 h-10 text-primary mb-3" />
              <CardTitle className="text-base">Tareas con subtareas</CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
            <CardHeader>
              <Award className="w-10 h-10 text-primary mb-3" />
              <CardTitle className="text-base">Entregas y calificaciones</CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
            <CardHeader>
              <Bell className="w-10 h-10 text-primary mb-3" />
              <CardTitle className="text-base">Notificaciones inteligentes</CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
            <CardHeader>
              <Network className="w-10 h-10 text-primary mb-3" />
              <CardTitle className="text-base">Diagramas Mermaid</CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-primary mb-3" />
              <CardTitle className="text-base">Estadísticas completas</CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
            <CardHeader>
              <FileText className="w-10 h-10 text-primary mb-3" />
              <CardTitle className="text-base">Notas rápidas</CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
            <CardHeader>
              <Users className="w-10 h-10 text-primary mb-3" />
              <CardTitle className="text-base">Grupos colaborativos</CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
            <CardHeader>
              <Clock className="w-10 h-10 text-primary mb-3" />
              <CardTitle className="text-base">Seguimiento de tiempo</CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
            <CardHeader>
              <MessageSquare className="w-10 h-10 text-primary mb-3" />
              <CardTitle className="text-base">Chat IA integrado</CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
            <CardHeader>
              <Target className="w-10 h-10 text-primary mb-3" />
              <CardTitle className="text-base">Perfiles personalizados</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
}
