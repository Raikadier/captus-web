import { Button } from "@/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingNav() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">Captus</span>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <a
            href="#problema"
            className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 group"
          >
            <span className="relative z-10">El Problema</span>
            <span className="absolute inset-x-4 bottom-1.5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
          </a>
          <a
            href="#solucion"
            className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 group"
          >
            <span className="relative z-10">Solución</span>
            <span className="absolute inset-x-4 bottom-1.5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
          </a>
          <a
            href="#caracteristicas"
            className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 group"
          >
            <span className="relative z-10">Características</span>
            <span className="absolute inset-x-4 bottom-1.5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
          </a>
          <a
            href="#tecnologia"
            className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 group"
          >
            <span className="relative z-10">Tecnología</span>
            <span className="absolute inset-x-4 bottom-1.5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/login">
              Probar Demo <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
