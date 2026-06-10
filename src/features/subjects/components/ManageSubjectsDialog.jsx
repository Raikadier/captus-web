// Manage Subjects Dialog — las materias son los cursos del usuario
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import apiClient from '../../../shared/api/client';
import { unwrapList } from '../../../shared/api/unwrap';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { ScrollArea } from '../../../ui/scroll-area';
import Loading from '../../../ui/loading';
import { BookOpen, Plus, Loader2 } from 'lucide-react';

const COLORS = [
  { name: 'Blue', value: 'blue', class: 'bg-blue-600' },
  { name: 'Green', value: 'green', class: 'bg-primary' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-600' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-600' },
  { name: 'Red', value: 'red', class: 'bg-red-600' },
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-600' },
];

function mapCourseToSubject(course) {
  return {
    id: course.id,
    name: course.title || course.name,
    grade: course.grade ?? course.averageGrade,
    progress: course.progress ?? 0,
    color: course.color || 'blue',
  };
}

function getColorIndicator(color) {
  const named = COLORS.find((c) => c.value === color);
  if (named) return { className: named.class };
  if (color?.startsWith('#')) return { style: { backgroundColor: color } };
  return { className: 'bg-gray-500' };
}

export function ManageSubjectsDialog({ trigger, onUpdate }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', color: 'blue' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const isTeacher = user?.user_metadata?.role === 'teacher' || user?.app_metadata?.role === 'teacher';

  useEffect(() => {
    if (open) {
      fetchCourses();
    }
  }, [open, isTeacher]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const endpoint = isTeacher ? '/courses/teacher' : '/courses/student';
      const response = await apiClient.get(endpoint);
      const courses = unwrapList(response.data);
      setSubjects(courses.map(mapCourseToSubject));
    } catch (err) {
      console.error('Error fetching courses:', err);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      setCreating(true);
      setError(null);

      await apiClient.post('/courses', {
        title: formData.name,
        description: formData.description || '',
      });

      setFormData({ name: '', description: '', color: 'blue' });
      await fetchCourses();
      if (onUpdate) onUpdate();

    } catch (err) {
      console.error('Error creating subject:', err);
      setError(err.response?.data?.error || 'Error al crear materia. Verifica tus permisos.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <BookOpen className="mr-2 h-4 w-4" />
            Materias
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gestión Académica</DialogTitle>
          <DialogDescription>
            {isTeacher
              ? 'Administra tus cursos (materias) y calificaciones.'
              : 'Visualiza tus cursos inscritos y progreso académico.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6 py-4">

          {/* Teacher Create Section */}
          {isTeacher && (
            <div className="bg-muted/50 p-4 rounded-xl space-y-4 border">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" /> Nuevo Curso
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del curso</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Matemáticas"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción (opcional)</Label>
                  <Input
                    id="description"
                    placeholder="Breve descripción del curso"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {error && <p className="text-xs text-destructive font-medium">{error}</p>}

                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={creating}>
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear Curso'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Subjects List */}
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="font-medium text-sm mb-3">Cursos ({subjects.length})</h3>
            <ScrollArea className="flex-1 pr-4">
              {loading ? (
                <Loading message="Cargando..." fullScreen={false} />
              ) : subjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-dashed border-2 rounded-lg">
                  {isTeacher
                    ? 'No tienes cursos creados. Crea uno arriba o desde la sección Cursos.'
                    : 'No estás inscrito en ningún curso.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {subjects.map((subject) => {
                    const colorIndicator = getColorIndicator(subject.color);
                    return (
                      <div key={subject.id} className="flex items-center justify-between p-3 bg-card rounded-xl border shadow-sm">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-10 rounded-full ${colorIndicator.className || ''}`}
                            style={colorIndicator.style}
                          />
                          <div>
                            <p className="font-medium leading-none">{subject.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {subject.grade != null ? (
                                <>Promedio: <span className="font-bold text-foreground">{subject.grade}</span></>
                              ) : (
                                <>Progreso: <span className="font-bold text-foreground">{subject.progress}%</span></>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
