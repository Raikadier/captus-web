import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, CalendarCheck } from 'lucide-react';
import { Card } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Label } from '../../../ui/label';
import { getPeriods, createPeriod, updatePeriod, deletePeriod, setActivePeriod } from '../../../shared/api/adminService';
import { toast } from 'sonner';

const EMPTY_FORM = { name: '', start_date: '', end_date: '' };

export default function AdminPeriodsPage() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);

  const load = async () => {
    try {
      const { data } = await getPeriods();
      setPeriods(data);
    } catch { toast.error('Error cargando periodos'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setOpen(true); };
  const openEdit   = (p) => {
    setEditing(p);
    setForm({
      name:       p.name,
      start_date: p.start_date?.slice(0, 10) ?? '',
      end_date:   p.end_date?.slice(0, 10)   ?? '',
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Escribe el nombre del periodo');
    setSaving(true);
    try {
      if (editing) {
        const { data } = await updatePeriod(editing.id, form);
        setPeriods(p => p.map(x => x.id === editing.id ? data : x));
        toast.success('Periodo actualizado');
      } else {
        const { data } = await createPeriod(form);
        setPeriods(p => [data, ...p]);
        toast.success('Periodo creado');
      }
      setOpen(false);
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este periodo?')) return;
    try {
      await deletePeriod(id);
      setPeriods(p => p.filter(x => x.id !== id));
      toast.success('Periodo eliminado');
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const handleSetActive = async (id) => {
    try {
      await setActivePeriod(id);
      setPeriods(p => p.map(x => ({ ...x, is_active: x.id === id })));
      toast.success('Periodo activo actualizado');
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Periodos académicos</h1>
          <p className="text-muted-foreground text-sm">Gestiona los periodos lectivos de la institución</p>
        </div>
        <Button className="gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Nuevo periodo</Button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Cargando…</div>
      ) : periods.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <CalendarCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No hay periodos. Crea el primero.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Periodo', 'Inicio', 'Fin', 'Estado', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {periods.map(p => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(p.start_date)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(p.end_date)}</td>
                  <td className="px-4 py-3">
                    {p.is_active
                      ? <Badge variant="default" className="text-xs">Activo</Badge>
                      : (
                        <button
                          onClick={() => handleSetActive(p.id)}
                          className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
                        >
                          Activar
                        </button>
                      )
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1 rounded hover:bg-accent transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {!p.is_active && (
                        <button onClick={() => handleDelete(p.id)} className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar periodo' : 'Nuevo periodo académico'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Nombre del periodo</Label>
              <Input placeholder="Ej: Primer semestre 2025" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Fecha inicio</Label>
                <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Fecha fin</Label>
                <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando…' : (editing ? 'Guardar cambios' : 'Crear periodo')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
