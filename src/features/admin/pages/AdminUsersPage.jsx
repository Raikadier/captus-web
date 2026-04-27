import { useEffect, useState } from 'react';
import { UserPlus, Trash2, ChevronDown } from 'lucide-react';
import { Card } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../ui/dialog';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { getMembers, inviteUser, removeUser, changeUserRole } from '../../../shared/api/adminService';
import { toast } from 'sonner';

const ROLE_COLOR = { student: 'secondary', teacher: 'default', admin: 'destructive' };
const ROLE_LABEL = { student: 'Estudiante', teacher: 'Docente', admin: 'Admin' };

export default function AdminUsersPage() {
  const [members, setMembers]   = useState([]);
  const [filter, setFilter]     = useState('');
  const [roleTab, setRoleTab]   = useState('all');
  const [loading, setLoading]   = useState(true);

  // Invite form
  const [email, setEmail]         = useState('');
  const [inviteRole, setInviteRole] = useState('student');
  const [inviting, setInviting]   = useState(false);
  const [open, setOpen]           = useState(false);

  const load = async (role) => {
    setLoading(true);
    try {
      const { data } = await getMembers(role === 'all' ? undefined : role);
      setMembers(data);
    } catch { toast.error('Error cargando usuarios'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(roleTab); }, [roleTab]);

  const handleInvite = async () => {
    if (!email) return toast.error('Escribe un email');
    setInviting(true);
    try {
      await inviteUser({ email, role: inviteRole });
      toast.success('Usuario invitado correctamente');
      setOpen(false);
      setEmail('');
      load(roleTab);
    } catch (e) { toast.error(e.response?.data?.error || 'Error al invitar'); }
    finally { setInviting(false); }
  };

  const handleRemove = async (userId, name) => {
    if (!confirm(`¿Remover a ${name} de la institución?`)) return;
    try {
      await removeUser(userId);
      toast.success('Usuario removido');
      setMembers(m => m.filter(u => u.id !== userId));
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { data } = await changeUserRole(userId, newRole);
      setMembers(m => m.map(u => u.id === userId ? { ...u, role: data.role } : u));
      toast.success('Rol actualizado');
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const filtered = members.filter(u =>
    u.name?.toLowerCase().includes(filter.toLowerCase()) ||
    u.email?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground text-sm">Gestiona estudiantes, docentes y admins</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserPlus className="w-4 h-4" /> Invitar usuario</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Invitar usuario a la institución</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label>Email del usuario</Label>
                <Input placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Rol</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Estudiante</SelectItem>
                    <SelectItem value="teacher">Docente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleInvite} disabled={inviting}>
                {inviting ? 'Enviando…' : 'Confirmar invitación'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {['all', 'student', 'teacher', 'admin'].map(r => (
          <button
            key={r}
            onClick={() => setRoleTab(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              roleTab === r ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-accent'
            }`}
          >
            {r === 'all' ? 'Todos' : ROLE_LABEL[r]}
          </button>
        ))}
        <Input
          placeholder="Buscar por nombre o email…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="ml-auto w-64"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Sin resultados</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Nombre', 'Email', 'Rol', 'Vinculado desde', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <Select value={u.role} onValueChange={r => handleRoleChange(u.id, r)}>
                      <SelectTrigger className="h-7 w-32 text-xs">
                        <Badge variant={ROLE_COLOR[u.role]} className="text-xs">{ROLE_LABEL[u.role]}</Badge>
                        <ChevronDown className="w-3 h-3 ml-auto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Estudiante</SelectItem>
                        <SelectItem value="teacher">Docente</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('es-CO') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemove(u.id, u.name)}
                      className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
