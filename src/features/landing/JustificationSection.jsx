import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Badge } from "@/ui/badge";
import {
  Zap,
  TrendingUp,
  BarChart3,
  Shield,
  Brain,
  CheckCircle2,
  Calendar,
  ArrowRight,
} from "lucide-react";

export default function JustificationSection() {
  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            ¿Por Qué Funciona?
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">La ciencia detrás de Captus</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Diseñado con principios de productividad, psicología cognitiva y tecnología de punta
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Reducción de Carga Cognitiva</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Al centralizar toda la información académica en una sola plataforma, eliminamos el "cambio de
                contexto" que agota tu energía mental. Tu cerebro puede enfocarse en lo importante: aprender.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Automatización Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                La IA aprende de tus patrones y automatiza tareas repetitivas: crear eventos, priorizar tareas, enviar
                recordatorios. Más tiempo para ti, menos tiempo organizando.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Feedback Visual Continuo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Las estadísticas en tiempo real te permiten ver tu progreso, identificar patrones y ajustar tu
                estrategia. El feedback positivo refuerza hábitos productivos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Diseño Contextual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Captus está diseñado específicamente para el contexto universitario colombiano: estructura de
                semestres, sistema de créditos, metodología de entregas. No es una app genérica adaptada.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ecosystem Diagram */}
        <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">El Ecosistema Captus</CardTitle>
            <CardDescription>Todo conectado, todo sincronizado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center items-center gap-8 p-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2 mx-auto">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm font-medium">IA Asistente</p>
              </div>
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2 mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm font-medium">Tareas</p>
              </div>
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2 mx-auto">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm font-medium">Calendario</p>
              </div>
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2 mx-auto">
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm font-medium">Estadísticas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
