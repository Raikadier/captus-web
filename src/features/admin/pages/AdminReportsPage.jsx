import { useEffect, useState } from 'react';
import { BarChart3, Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { Card } from '../../../ui/card';
import { getAdminStats, getMembers, getAdminCourses } from '../../../shared/api/adminService';
import { toast } from 'sonner';

function StatRow({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  const [stats, setStats]     = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminStats(), getAdminCourses()])
      .then(([s, c]) => { setStats(s.data); setCourses(c.data); })
      .catch(() => toast.error('Error cargando reportes'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-muted-foreground py-12 text-center">Cargando…</div>;

  const topCourses = [...courses]
    .sort((a, b) => (b.enrollments_count ?? 0) - (a.enrollments_count ?? 0))
    .slice(0, 5);

  const maxEnrollments = topCourses[0]?.enrollments_count || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-muted-foreground text-sm">Resumen de actividad institucional</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { icon: Users,         label: 'Estudiantes',   value: stats?.students,    color: 'bg-blue-500'    },
          { icon: GraduationCap, label: 'Docentes',      value: stats?.teachers,    color: 'bg-purple-500'  },
          { icon: BookOpen,      label: 'Cursos',        value: stats?.courses,     color: 'bg-emerald-500' },
          { icon: TrendingUp,    label: 'Matrículas',    value: stats?.enrollments, color: 'bg-orange-500'  },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="p-5 flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{value ?? '—'}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top courses by enrollment */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold">Cursos con más estudiantes</h2>
          </div>
          {topCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {topCourses.map(c => (
                <StatRow
                  key={c.id}
                  label={c.name}
                  value={c.enrollments_count ?? 0}
                  max={maxEnrollments}
                  color="bg-blue-500"
                />
              ))}
            </div>
          )}
        </Card>

        {/* Distribution */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold">Distribución de usuarios</h2>
          </div>
          {stats ? (
            <div className="space-y-3">
              <StatRow label="Estudiantes" value={stats.students ?? 0}
                max={(stats.students ?? 0) + (stats.teachers ?? 0)} color="bg-blue-500" />
              <StatRow label="Docentes" value={stats.teachers ?? 0}
                max={(stats.students ?? 0) + (stats.teachers ?? 0)} color="bg-purple-500" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin datos</p>
          )}

          <div className="pt-4 border-t border-border space-y-2">
            <p className="text-sm font-medium">Cobertura docente</p>
            {courses.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  {courses.filter(c => c.teacher_id).length} de {courses.length} cursos tienen docente asignado
                </p>
                <StatRow
                  label=""
                  value={courses.filter(c => c.teacher_id).length}
                  max={courses.length}
                  color="bg-emerald-500"
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Sin cursos</p>
            )}
          </div>
        </Card>
      </div>

      {/* Courses without teacher */}
      {courses.filter(c => !c.teacher_id).length > 0 && (
        <Card className="p-5 space-y-3">
          <h2 className="font-semibold text-amber-600">⚠ Cursos sin docente asignado</h2>
          <div className="flex flex-wrap gap-2">
            {courses.filter(c => !c.teacher_id).map(c => (
              <span key={c.id} className="px-3 py-1 rounded-full border border-amber-300 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-sm">
                {c.name}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
