import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Sparkles, ArrowRight, Code2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by AI – Productivity Reinvented
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent text-balance">
            Organiza tu vida académica con inteligencia
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl text-balance leading-relaxed">
            La plataforma inteligente que centraliza tus tareas, cursos, estadísticas y más. Diseñada para estudiantes
            y docentes universitarios.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button size="lg" className="text-base h-12 px-8" asChild>
              <Link to="/login">
                <Sparkles className="mr-2 w-5 h-5" />
                Probar Demo
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base h-12 px-8 bg-transparent" asChild>
              <a href="#tecnologia">
                <Code2 className="mr-2 w-5 h-5" />
                Documentación
              </a>
            </Button>
          </div>

          {/* Hero Mockup */}
          <div className="relative w-full max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 blur-3xl -z-10" />
            <div className="relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl">
              <div className="bg-muted/30 px-4 py-3 flex items-center gap-2 border-b border-border/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-primary/60" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground font-mono">captus.app/dashboard</span>
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-muted/50 via-background to-muted/30 p-8">
                <div className="grid grid-cols-3 gap-4 h-full">
                  <Card className="col-span-1 bg-card/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      <CardTitle className="text-sm">Tareas Completadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">24</div>
                    </CardContent>
                  </Card>
                  <Card className="col-span-2 bg-card/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Productividad Semanal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-24 flex items-end gap-2">
                        {[40, 65, 45, 80, 70, 90, 75].map((height, i) => (
                          <div key={i} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${height}%` }} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
