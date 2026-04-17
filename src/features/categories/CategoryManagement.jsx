import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Check, X, AlertTriangle, BarChart3, Clock } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/dialog';
import Loading from '../../ui/loading';
import apiClient from '../../shared/api/client';
import { toast } from 'sonner';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Temporizador para el diálogo de eliminación
  useEffect(() => {
    let interval;
    if (deleteDialog.open && deleteCountdown > 0) {
      interval = setInterval(() => {
        setDeleteCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [deleteDialog.open, deleteCountdown]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const [categoriesResponse, statsResponse] = await Promise.all([
        apiClient.get('/categories'),
        apiClient.get('/categories/stats/categories')
      ]);

      if (categoriesResponse.data && categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.data || []);
      }

      if (statsResponse.data && statsResponse.data.success) {
        setCategoryStats(statsResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }

    if (formData.name.trim().length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres');
      return;
    }

    // Verificar nombre único
    const nameExists = categories.some(cat =>
      cat.name.toLowerCase() === formData.name.trim().toLowerCase() &&
      cat.id_Category !== editingCategory?.id_Category
    );

    if (nameExists) {
      toast.error('Ya existe una categoría con ese nombre');
      return;
    }

    try {
      setSaving(true);
      const categoryData = {
        name: formData.name.trim()
      };

      if (editingCategory) {
        await apiClient.put(`/categories/${editingCategory.id_Category}`, categoryData);
        toast.success('Categoría actualizada exitosamente');
      } else {
        await apiClient.post('/categories', categoryData);
        toast.success('Categoría creada exitosamente');
      }

      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar la categoría';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setShowForm(true);
  };

  const handleDelete = (category) => {
    if (category.name === 'General') {
      toast.error('No se puede eliminar la categoría General');
      return;
    }

    setDeleteDialog({ open: true, category });
    setDeleteCountdown(5);
  };

  const confirmDelete = async () => {
    if (!deleteDialog.category) return;

    try {
      setDeleting(true);
      await apiClient.delete(`/categories/${deleteDialog.category.id_Category}`);
      toast.success('Categoría eliminada exitosamente');
      await fetchCategories();
      setDeleteDialog({ open: false, category: null });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error al eliminar la categoría');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, category: null });
    setDeleteCountdown(5);
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setEditingCategory(null);
    setShowForm(false);
  };

  const getCategoryStats = (categoryId) => {
    const stats = categoryStats.find(stat => stat.id === categoryId);
    return stats || { totalTasks: 0, completedTasks: 0, completionRate: 0 };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading message="Cargando categorías..." fullScreen={false} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="text-primary" size={24} />
            Gestión de Categorías
          </h2>
          <p className="text-muted-foreground mt-1">
            Organiza tus tareas con categorías personalizadas
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus size={18} className="mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6 bg-card rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            {editingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nombre de la Categoría
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                placeholder="Ej: Trabajo, Estudio, Personal..."
                className="w-full"
                maxLength={50}
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Máximo 50 caracteres
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                {saving ? (
                  'Guardando...'
                ) : (
                  <>
                    <Check size={18} className="mr-2" />
                    {editingCategory ? 'Actualizar' : 'Crear'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={saving}
              >
                <X size={18} className="mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Categories List */}
      <div className="grid gap-4">
        {categories.length === 0 ? (
          <Card className="p-12 text-center bg-card rounded-xl border border-dashed">
            <Tag className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No hay categorías
            </h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primera categoría para empezar a organizar tus tareas
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus size={18} className="mr-2" />
              Crear Primera Categoría
            </Button>
          </Card>
        ) : (
          categories.map((category) => (
            <Card key={category.id_Category} className="p-4 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <Tag className="text-white" size={18} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryStats(category.id_Category).totalTasks} tareas
                      </Badge>
                      {getCategoryStats(category.id_Category).totalTasks > 0 && (
                        <Badge
                          variant={getCategoryStats(category.id_Category).completionRate === 100 ? "default" : "outline"}
                          className={`text-xs ${getCategoryStats(category.id_Category).completionRate === 100
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "text-gray-600 border-gray-200"
                            }`}
                        >
                          {getCategoryStats(category.id_Category).completionRate}% completado
                        </Badge>
                      )}
                      {category.name === 'General' && (
                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                          Predeterminada
                        </Badge>
                      )}
                    </div>
                    {getCategoryStats(category.id_Category).totalTasks > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progreso</span>
                          <span>{getCategoryStats(category.id_Category).completedTasks}/{getCategoryStats(category.id_Category).totalTasks}</span>
                        </div>
                        <Progress
                          value={getCategoryStats(category.id_Category).completionRate}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                    className="text-gray-600 hover:text-primary"
                  >
                    <Edit2 size={16} />
                  </Button>
                  {category.name !== 'General' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Info Section */}
      <Card className="p-6 bg-blue-50 border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-blue-600 mt-0.5" size={20} />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Información Importante</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• La categoría "General" es creada automáticamente y no puede ser eliminada</li>
              <li>• Al eliminar una categoría, todas las tareas asociadas también serán eliminadas</li>
              <li>• Los nombres de categorías deben ser únicos</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && cancelDelete()}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription className="text-left">
              <div className="space-y-3">
                <p>
                  ¿Estás seguro de que quieres eliminar la categoría <strong>"{deleteDialog.category?.name}"</strong>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="font-medium text-red-900 mb-2">⚠️ Consecuencias de esta acción:</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• Todas las tareas asociadas a esta categoría serán eliminadas permanentemente</li>
                    <li>• Los subtasks de esas tareas también serán eliminados</li>
                    <li>• Esta acción no se puede deshacer</li>
                    <li>• Las estadísticas relacionadas se actualizarán automáticamente</li>
                  </ul>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>El botón de confirmación estará disponible en {deleteCountdown} segundos</span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteCountdown > 0 || deleting}
              className="min-w-[120px]"
            >
              {deleting ? (
                'Eliminando...'
              ) : deleteCountdown > 0 ? (
                `Eliminar (${deleteCountdown}s)`
              ) : (
                'Eliminar Categoría'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManagement;