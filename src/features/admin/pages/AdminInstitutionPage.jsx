import { useEffect, useState } from 'react';
import { Building2, Save } from 'lucide-react';
import { Card } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { getInstitution, updateInstitution, createInstitution } from '../../../shared/api/adminService';
import { toast } from 'sonner';

export default function AdminInstitutionPage() {
  const [institution, setInstitution] = useState(null);
  const [form, setForm]               = useState({ name: '', address: '', phone: '', email: '', website: '' });
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    getInstitution()
      .then(({ data }) => {
        if (data) {
          setInstitution(data);
          setForm({
            name:    data.name    ?? '',
            address: data.address ?? '',
            phone:   data.phone   ?? '',
            email:   data.email   ?? '',
            website: data.website ?? '',
          });
        }
      })
      .catch(() => {/* no institution yet – OK */})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('El nombre de la institución es obligatorio');
    setSaving(true);
    try {
      if (institution) {
        const { data } = await updateInstitution(institution.id, form);
        setInstitution(data);
        toast.success('Institución actualizada');
      } else {
        const { data } = await createInstitution(form);
        setInstitution(data);
        toast.success('Institución creada');
      }
    } catch (e) { toast.error(e.response?.data?.error || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const field = (key, label, placeholder, type = 'text') => (
    <div className="space-y-1" key={key}>
      <Label>{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  );

  if (loading) return <div className="text-muted-foreground py-12 text-center">Cargando…</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Institución</h1>
        <p className="text-muted-foreground text-sm">Información general de tu institución educativa</p>
      </div>

      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-3 pb-2 border-b border-border">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{institution?.name || 'Nueva institución'}</p>
            <p className="text-xs text-muted-foreground">{institution ? 'Datos registrados' : 'Sin configurar'}</p>
          </div>
        </div>

        {field('name',    'Nombre de la institución', 'Ej: Colegio San Marcos')}
        {field('address', 'Dirección',                'Calle 10 # 20-30, Ciudad')}
        {field('phone',   'Teléfono',                 '+57 300 000 0000', 'tel')}
        {field('email',   'Correo institucional',     'info@institución.edu', 'email')}
        {field('website', 'Sitio web',                'https://www.institución.edu', 'url')}

        <Button className="w-full gap-2" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? 'Guardando…' : (institution ? 'Guardar cambios' : 'Registrar institución')}
        </Button>
      </Card>
    </div>
  );
}
