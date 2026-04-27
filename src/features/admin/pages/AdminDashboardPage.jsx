import { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { Card } from '../../../ui/card';
import { getAdminStats, getInstitution } from '../../../shared/api/adminService';
import { toast } from 'sonner';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="p-6 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value ?? '—'}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats]       = useState(null);
  const [institution, setInst]  = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getAdminStats(), getInstitution()])
      .then(([s, i]) => {
        setStats(s.data);
        setInst(i.data);
      })
      .catch(() => toast.error('Error cargando el panel'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-muted-foreground">Cargando…</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{institution?.name ?? 'Mi Institución'}</h1>
        <p className="text-muted-foreground text-sm">Panel de administración</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users}         label="Estudiantes"  value={stats?.students}    color="bg-blue-500" />
        <StatCard icon={GraduationCap} label="Docentes"     value={stats?.teachers}    color="bg-purple-500" />
        <StatCard icon={BookOpen}      label="Cursos"       value={stats?.courses}     color="bg-emerald-500" />
        <StatCard icon={TrendingUp}    label="Matrículas"   value={stats?.enrollments} color="bg-orange-500" />
      </div>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Invitar usuario',    href: '/admin/users'   },
            { label: 'Crear curso',        href: '/admin/courses' },
            { label: 'Gestionar periodos', href: '/admin/periods' },
            { label: 'Escala de notas',    href: '/admin/grading' },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="flex items-center justify-center text-center text-sm font-medium border border-border rounded-lg px-4 py-3 hover:bg-accent transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
