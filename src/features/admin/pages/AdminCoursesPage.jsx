import { useEffect, useState } from 'react';
import { BookOpen, UserPlus, Users, Plus } from 'lucide-react';
import { Card } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../ui/dialog';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { getAdminCourses, createAdminCourse, assignTeacher, bulkEnroll, getMembers } from '../../../shared/api/adminService';
import { toast } from 'sonner';

export default function AdminCoursesPage() {
  const [courses, setCourses]   = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filter, setFilter]     = useState('');
  const [loading, setLoading]   = useState(true);

  // Create course dialog
  const [createOpen, setCreateOpen]   = useState(false);
  const [courseName, setCourseName]   = useState('');
  const [courseDesc, setCourseDesc]   = useState('');
  const [creating, setCreating]       = useState(false);

  // Assign teacher dialog
  const [assignOpen, setAssignOpen]         = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [assigning, setAssigning]           = useState(false);

  // Bulk enroll dialog
  const [enrollOpen, setEnrollOpen]   = useState(false);
  const [enrollCourse, setEnrollCourse] = useState(null);
  const [enrollEmails, setEnrollEmails] = useState('');
  const [enrolling, setEnrolling]     = useState(false);

  useEffect(() => {
    Promise.all([
      getAdminCourses(),
      getMembers('teacher'),
    ]).then(([c, t]) => {
      setCourses(c.data);
      setTeachers(t.data);
    }).catch(() => toast.error('Error cargando cursos'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!courseName.trim()) return toast.error('Escribe el nombre del curso');
    setCreating(true);
    try {
      const { data } = await createAdminCourse({ name: courseName, description: courseDesc });
      setCourses(c => [data, ...c]);
      toast.success('Curso creado');
      setCreateOpen(false);
      setCourseName('');
      setCourseDesc('');
    } catch (e) { toast.error(e.response?.data?.error || 'Error al crear'); }
    finally { setCreating(false); }
  };

  const openAssign = (course) => { setSelectedCourse(course); setSelectedTeacher(''); setAssignOpen(true); };
  const handleAssign = async () => {
    if (!selectedTeacher) return toast.error('Selecciona un docente');
    setAssigning(true);
    try {
      await assignTeacher(selectedCourse.id, selectedTeacher);
      toast.success('Docente asignado');
      setAssignOpen(false);
      const { data } = await getAdminCourses();
      setCourses(data);
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
    finally { setAssigning(false); }
  };

  const openEnroll = (course) => { setEnrollCourse(course); setEnrollEmails(''); setEnrollOpen(true); };
  const handleEnroll = async () => {
    const emails = enrollEmails.split(/[\n,]+/).map(e => e.trim()).filter(Boolean);
    if (!emails.length) return toast.error('Escribe al menos un email');
    setEnrolling(true);
    try {
      const { data } = await bulkEnroll(enrollCourse.id, emails);
      toast.success(`${data.enrolled} estudiantes matriculados`);
      setEnrollOpen(false);
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
    finally { setEnrolling(false); }
  };

  const filtered = courses.filter(c =>
    c.name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cursos</h1>
          <p className="text-muted-foreground text-sm">Gestiona los cursos de la institución</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Nuevo curso</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Crear nuevo curso</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label>Nombre del curso</Label>
                <Input placeholder="Ej: Matemáticas 10°" value={courseName} onChange={e => setCourseName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Descripción (opcional)</Label>
                <Input placeholder="Descripción breve…" value={courseDesc} onChange={e => setCourseDesc(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handleCreate} disabled={creating}>
                {creating ? 'Creando…' : 'Crear curso'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Buscar curso…"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="w-72"
      />

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Cargando…</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No hay cursos. Crea el primero.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(course => (
            <Card key={course.id} className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{course.name}</h3>
                  {course.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">{course.description}</p>
                  )}
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {course.enrollments_count ?? 0} alumnos
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {course.teacher_name
                  ? <span>Docente: <span className="text-foreground font-medium">{course.teacher_name}</span></span>
                  : <span className="italic">Sin docente asignado</span>}
              </div>
              <div className="flex gap-2 mt-auto pt-2 border-t border-border">
                <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => openAssign(course)}>
                  <UserPlus className="w-3.5 h-3.5" /> Docente
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => openEnroll(course)}>
                  <Users className="w-3.5 h-3.5" /> Matricular
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Teacher Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar docente a {selectedCourse?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Docente</Label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger><SelectValue placeholder="Selecciona un docente" /></SelectTrigger>
                <SelectContent>
                  {teachers.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name || t.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleAssign} disabled={assigning}>
              {assigning ? 'Asignando…' : 'Confirmar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Enroll Dialog */}
      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Matricular estudiantes en {enrollCourse?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Emails de estudiantes</Label>
              <textarea
                className="w-full border border-border rounded-md p-2 text-sm bg-background min-h-28 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="uno@ejemplo.com&#10;dos@ejemplo.com&#10;…"
                value={enrollEmails}
                onChange={e => setEnrollEmails(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Separados por coma o salto de línea</p>
            </div>
            <Button className="w-full" onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? 'Matriculando…' : 'Matricular'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
