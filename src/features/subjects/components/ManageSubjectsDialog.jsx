// Manage Subjects Dialog
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import apiClient from '../../../shared/api/client';
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
import { BookOpen, Plus, Loader2, Trash2 } from 'lucide-react';

const COLORS = [
  { name: 'Blue', value: 'blue', class: 'bg-blue-600' },
  { name: 'Green', value: 'green', class: 'bg-green-600' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-600' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-600' },
  { name: 'Red', value: 'red', class: 'bg-red-600' },
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-600' },
];

export function ManageSubjectsDialog({ trigger, onUpdate }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', grade: '', progress: '', color: 'blue' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is teacher (role in metadata)
  const isTeacher = user?.user_metadata?.role === 'teacher' || user?.app_metadata?.role === 'teacher';

  useEffect(() => {
    if (open) {
      fetchSubjects();
    }
  }, [open]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/subjects'); // Assuming this endpoint exists based on SubjectRoutes
      setSubjects(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
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

      const payload = {
        name: formData.name,
        grade: parseFloat(formData.grade) || 0,
        progress: parseInt(formData.progress) || 0,
        color: formData.color
      };

      await apiClient.post('/subjects', payload);

      // Reset form and refresh list
      setFormData({ name: '', grade: '', progress: '', color: 'blue' });
      await fetchSubjects();
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
              ? "Administra las materias y calificaciones del curso."
              : "Visualiza tus materias y progreso académico."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6 py-4">

          {/* Teacher Create Section */}
          {isTeacher && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-4 border">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" /> Nueva Materia
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      placeholder="Ej: Matemáticas"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Promedio</Label>
                    <Input
                      id="grade"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="0.0"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: c.value })}
                        className={`w-6 h-6 rounded-full transition-all ${c.class} ${formData.color === c.value ? 'ring-2 ring-offset-2 ring-black' : 'opacity-70 hover:opacity-100'
                          }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {error && <p className="text-xs text-destructive font-medium">{error}</p>}

                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={creating}>
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear Materia'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Subjects List */}
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="font-medium text-sm mb-3">Materias Activas ({subjects.length})</h3>
            <ScrollArea className="flex-1 pr-4">
              {loading ? (
                <Loading message="Cargando..." fullScreen={false} />
              ) : subjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-dashed border-2 rounded-lg">
                  No hay materias registradas.
                </div>
              ) : (
                <div className="space-y-3">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center justify-between p-3 bg-card rounded-lg border shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-10 rounded-full ${COLORS.find(c => c.value === subject.color)?.class || 'bg-gray-500'
                          }`} />
                        <div>
                          <p className="font-medium leading-none">{subject.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Promedio: <span className="font-bold text-foreground">{subject.grade}</span>
                          </p>
                        </div>
                      </div>
                      {/* Future: Edit/Delete buttons can go here */}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
