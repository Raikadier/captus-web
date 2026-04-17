import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Target, Sparkles } from "lucide-react";

export default function ProblemSection() {
  return (
    <section id="problema" className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            El Problema
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            La vida académica es más compleja de lo que debería ser
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Los estudiantes enfrentan desafíos diarios que las plataformas tradicionales no resuelven
          </p>
        </div>

        {/* Pain Points Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Target className="w-5 h-5" />
                AulaWeb: Limitaciones Reales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                <p className="text-sm text-muted-foreground">Interfaz rígida y poco intuitiva</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                <p className="text-sm text-muted-foreground">Cero personalización del espacio de trabajo</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                <p className="text-sm text-muted-foreground">No permite crear tareas personales</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                <p className="text-sm text-muted-foreground">Sin sistema de recordatorios inteligentes</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                <p className="text-sm text-muted-foreground">Ausencia total de análisis y estadísticas</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                <p className="text-sm text-muted-foreground">Ninguna integración con IA</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" />
                La Necesidad Real
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <p className="text-sm text-muted-foreground">
                  Centralizar información dispersa en múltiples plataformas
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <p className="text-sm text-muted-foreground">Automatizar tareas repetitivas y recordatorios</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <p className="text-sm text-muted-foreground">Visualizar progreso y productividad en tiempo real</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <p className="text-sm text-muted-foreground">Asistencia inteligente para organización académica</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <p className="text-sm text-muted-foreground">Interfaz moderna y adaptada al contexto universitario</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Before vs After */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center p-8 rounded-xl border border-border bg-card">
            <div className="text-4xl mb-4">😓</div>
            <h3 className="font-semibold mb-2">Antes</h3>
            <p className="text-sm text-muted-foreground">
              Múltiples apps, información dispersa, carga cognitiva alta, sin automatización
            </p>
          </div>
          <div className="text-center p-8 rounded-xl border border-primary/20 bg-primary/5">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="font-semibold mb-2 text-primary">Después</h3>
            <p className="text-sm text-muted-foreground">
              Todo centralizado, IA asistente, estadísticas en tiempo real, automatización inteligente
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
