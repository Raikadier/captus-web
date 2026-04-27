import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { Card } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Label } from '../../../ui/label';
import {
  getGradingScales, createGradingScale, updateGradingScale,
  deleteGradingScale, setDefaultGradingScale,
} from '../../../shared/api/adminService';
import { toast } from 'sonner';

const EMPTY_FORM = { name: '', min_score: 0, max_score: 100, levels: [{ label: '', min: 0, max: 100, color: '#22c55e' }] };

export default function AdminGradingPage() {
  const [scales, setScales]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState(null); // null = create mode
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);

  const load = async () => {
    try {
      const { data } = await getGradingScales();
      setScales(data);
    } catch { toast.error('Error cargando escalas'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setOpen(true); };
  const openEdit = (scale) => {
    setEditing(scale);
    setForm({
      name: scale.name,
      min_score: scale.min_score,
      max_score: scale.max_score,
      levels: scale.levels?.length ? scale.levels : EMPTY_FORM.levels,
    });
    setOpen(true);
  };

  const addLevel = () =>
    setForm(f => ({ ...f, levels: [...f.levels, { label: '', min: 0, max: 100, color: '#6366f1' }] }));

  const removeLevel = (i) =>
    setForm(f => ({ ...f, levels: f.levels.filter((_, idx) => idx !== i) }));

  const updateLevel = (i, key, val) =>
    setForm(f => {
      const levels = f.levels.map((l, idx) => idx === i ? { ...l, [key]: val } : l);
      return { ...f, levels };
    });

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Escribe el nombre de la escala');
    setSaving(true);
    try {
      if (editing) {
        await updateGradingScale(editing.id, form);
        toast.success('Escala actualizada');
      } else {
        await createGradingScale(form);
        toast.success('Escala creada');
      }
      setOpen(false);
      load();
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta escala?')) return;
    try {
      await deleteGradingScale(id);
      setScales(s => s.filter(x => x.id !== id));
      toast.success('Escala eliminada');
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultGradingScale(id);
      setScales(s => s.map(x => ({ ...x, is_default: x.id === id })));
      toast.success('Escala predeterminada actualizada');
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Escalas de calificación</h1>
          <p className="text-muted-foreground text-sm">Define cómo se convierten notas en desempeños</p>
        </div>
        <Button className="gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Nueva escala</Button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Cargando…</div>
      ) : scales.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No hay escalas. Crea la primera.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {scales.map(scale => (
            <Card key={scale.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{scale.name}</h3>
                  {scale.is_default && <Badge variant="default" className="text-xs">Predeterminada</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  {!scale.is_default && (
                    <button
                      onClick={() => handleSetDefault(scale.id)}
                      title="Establecer como predeterminada"
                      className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => openEdit(scale)} className="p-1 rounded hover:bg-accent transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(scale.id)} className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Rango: {scale.min_score} – {scale.max_score}</p>
              {scale.levels?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {scale.levels.map((l, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: l.color || '#6b7280' }}
                    >
                      {l.label} ({l.min}–{l.max})
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar escala' : 'Nueva escala de calificación'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Escala numérica 1–10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Nota mínima</Label>
                <Input type="number" value={form.min_score} onChange={e => setForm(f => ({ ...f, min_score: +e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Nota máxima</Label>
                <Input type="number" value={form.max_score} onChange={e => setForm(f => ({ ...f, max_score: +e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Niveles de desempeño</Label>
                <button onClick={addLevel} className="text-xs text-primary hover:underline">+ Añadir nivel</button>
              </div>
              {form.levels.map((level, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/40 rounded-lg p-2">
                  <Input
                    className="flex-1 h-7 text-xs"
                    placeholder="Etiqueta (ej: Excelente)"
                    value={level.label}
                    onChange={e => updateLevel(i, 'label', e.target.value)}
                  />
                  <Input
                    className="w-16 h-7 text-xs"
                    type="number"
                    placeholder="Min"
                    value={level.min}
                    onChange={e => updateLevel(i, 'min', +e.target.value)}
                  />
                  <span className="text-muted-foreground text-xs">–</span>
                  <Input
                    className="w-16 h-7 text-xs"
                    type="number"
                    placeholder="Max"
                    value={level.max}
                    onChange={e => updateLevel(i, 'max', +e.target.value)}
                  />
                  <input
                    type="color"
                    value={level.color}
                    onChange={e => updateLevel(i, 'color', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border border-border"
                    title="Color"
                  />
                  {form.levels.length > 1 && (
                    <button onClick={() => removeLevel(i)} className="p-0.5 hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando…' : (editing ? 'Guardar cambios' : 'Crear escala')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
