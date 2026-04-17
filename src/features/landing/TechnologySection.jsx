import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Code2, Server, Database, Layers } from "lucide-react";

export default function TechnologySection() {
  return (
    <section id="tecnologia" className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Tecnología
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Arquitectura moderna y escalable</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Construido con las mejores tecnologías del mercado para garantizar rendimiento y seguridad
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Frontend Moderno</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    React
                  </Badge>
                  <span className="text-sm text-muted-foreground">Componentes reutilizables</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Vite
                  </Badge>
                  <span className="text-sm text-muted-foreground">Build ultra rápido</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Tailwind
                  </Badge>
                  <span className="text-sm text-muted-foreground">Estilos modernos</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Server className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Backend Robusto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Node.js
                  </Badge>
                  <span className="text-sm text-muted-foreground">Runtime eficiente</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Express
                  </Badge>
                  <span className="text-sm text-muted-foreground">API REST escalable</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    JWT
                  </Badge>
                  <span className="text-sm text-muted-foreground">Autenticación segura</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Base de Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Supabase
                  </Badge>
                  <span className="text-sm text-muted-foreground">PostgreSQL cloud</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Real-time
                  </Badge>
                  <span className="text-sm text-muted-foreground">Sincronización live</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Row Level Security
                  </Badge>
                  <span className="text-sm text-muted-foreground">Seguridad avanzada</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stack Visualization */}
        <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Stack Tecnológico</CardTitle>
            <CardDescription>Arquitectura modular y escalable</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Layers className="w-10 h-10 text-primary" />
                </div>
                <h4 className="font-semibold">Frontend</h4>
                <p className="text-sm text-muted-foreground">React + Vite + Tailwind</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Server className="w-10 h-10 text-primary" />
                </div>
                <h4 className="font-semibold">Backend</h4>
                <p className="text-sm text-muted-foreground">Node.js + Express</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Database className="w-10 h-10 text-primary" />
                </div>
                <h4 className="font-semibold">Database</h4>
                <p className="text-sm text-muted-foreground">Supabase (PostgreSQL)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
