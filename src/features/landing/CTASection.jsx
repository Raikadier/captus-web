import { Button } from "@/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Sparkles, Github } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <Card className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-primary/20">
          <CardHeader className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-4xl md:text-5xl mb-6 text-balance">
              Organiza tu vida académica con inteligencia
            </CardTitle>
            <CardDescription className="text-lg mb-8">
              Únete a los estudiantes que ya están transformando su productividad universitaria
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base h-12 px-8" asChild>
                <Link to="/login">
                  <Sparkles className="mr-2 w-5 h-5" />
                  Comenzar Ahora
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base h-12 px-8 bg-transparent" asChild>
                <a href="https://github.com/captus-app" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 w-5 h-5" />
                  Ver Código Fuente
                </a>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
