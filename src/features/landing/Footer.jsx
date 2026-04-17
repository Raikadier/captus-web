import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30 py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">Captus</span>
            </div>
            <p className="text-sm text-muted-foreground">
              La plataforma inteligente para gestión académica universitaria
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Producto</h4>
            <ul className="space-y-2">
              <li>
                <a href="#caracteristicas" className="text-sm text-muted-foreground hover:text-foreground">
                  Características
                </a>
              </li>
              <li>
                <a href="#tecnologia" className="text-sm text-muted-foreground hover:text-foreground">
                  Tecnología
                </a>
              </li>
              <li>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
                  Demo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Documentación
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Guías
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Soporte
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Comunidad</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/captus-app"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Captus. Desarrollado en la Universidad Popular del Cesar
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacidad
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Términos
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contacto
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
