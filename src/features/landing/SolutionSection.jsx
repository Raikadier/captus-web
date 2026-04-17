import { Card, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import {
  Brain,
  Calendar,
  CheckCircle2,
  FileText,
  BarChart3,
  Users,
  Bell,
  Network,
  BookOpen,
} from "lucide-react";

export default function SolutionSection() {
  return (
    <section id="solucion" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
            La Solución
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Captus: Tu ecosistema académico inteligente
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Una plataforma completa que centraliza, automatiza y potencia tu productividad universitaria
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Gestión de Tareas</CardTitle>
              <CardDescription>
                Crea, organiza y completa tareas con subtareas, prioridades y fechas límite
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Calendario Inteligente</CardTitle>
              <CardDescription>
                Visualiza todos tus eventos académicos en un solo lugar con vista mensual y semanal
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Gestión de Cursos</CardTitle>
              <CardDescription>
                Centraliza la información de todos tus cursos, entregas y calificaciones
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Notas Rápidas</CardTitle>
              <CardDescription>Captura ideas al instante con nuestro editor de notas minimalista</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Estadísticas Avanzadas</CardTitle>
              <CardDescription>
                Visualiza tu productividad semanal, tareas completadas y patrones de estudio
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Asistente IA</CardTitle>
              <CardDescription>Crea tareas, eventos y obtén recomendaciones personalizadas con IA</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Grupos y Proyectos</CardTitle>
              <CardDescription>Colabora con compañeros en proyectos grupales de forma organizada</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Network className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Diagramas Mermaid</CardTitle>
              <CardDescription>
                Crea diagramas de flujo, mapas mentales y organigramas directamente en la app
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Notificaciones Smart</CardTitle>
              <CardDescription>
                Recibe alertas inteligentes sobre entregas próximas y eventos importantes
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
}
