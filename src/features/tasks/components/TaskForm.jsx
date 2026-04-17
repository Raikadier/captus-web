// TaskForm - Form for creating and editing tasks
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';

const TaskForm = ({ task, categories, priorities, onSubmit, onCancel, isModal = false }) => {
  const [formData, setFormData] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      title: '',
      description: '',
      due_date: tomorrow.toISOString().split('T')[0], // Default to tomorrow
      priority_id: '1', // Default to "Baja" (1)
      category_id: '6' // Default to existing category (Personal = 6)
    };
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
        priority_id: task.priority_id || 1,
        category_id: task.category_id || 6 // Use existing category ID (Personal = 6)
      });
    }
  }, [task]);

  // Date quick buttons
  const setDate = (date) => {
    setFormData(prev => ({
      ...prev,
      due_date: date.toISOString().split('T')[0]
    }));
  };

  const handleToday = () => setDate(new Date());
  const handleTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow);
  };
  const handleWeekend = () => {
    const today = new Date();
    const daysUntilSaturday = (6 - today.getDay()) % 7;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
    setDate(saturday);
  };
  const handleNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setDate(nextWeek);
  };

  const handleInputChange = (field, value) => {
    console.log('📅 FORM INPUT CHANGE - Field:', field, 'Value:', value);

    if (field === 'due_date') {
      // Validate date is not in the past
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      console.log('📅 DATE VALIDATION - Selected:', selectedDate.toISOString(), 'Today:', today.toISOString());
      console.log('📅 DATE VALIDATION - Selected < Today:', selectedDate < today);

      if (selectedDate < today) {
        console.log('📅 DATE VALIDATION - BLOCKED: Date is in the past');
        setError('La fecha límite no puede ser anterior a hoy. Selecciona una fecha actual o futura.');
      } else {
        console.log('📅 DATE VALIDATION - ALLOWED: Date is valid');
        setError(''); // Clear error if date is valid
      }
    }

    if (field === 'category_id') {
      console.log('🏷️ CATEGORY CHANGE - New category_id:', value, 'Type:', typeof value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    console.log('📝 FORM DATA UPDATED - New formData:', JSON.stringify({
      ...formData,
      [field]: value
    }, null, 2));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('📤 FORM SUBMIT - Raw formData:', JSON.stringify(formData, null, 2));

    if (!formData.title.trim()) {
      console.log('❌ FORM SUBMIT - BLOCKED: Title is empty');
      alert('El título es obligatorio');
      return;
    }

    if (error) {
      console.log('❌ FORM SUBMIT - BLOCKED: Validation error');
      alert(error);
      return;
    }

    // Ensure priority_id and category_id are valid numbers - ALL tasks must have valid IDs
    const submitData = {
      ...formData,
      priority_id: formData.priority_id && formData.priority_id !== '' ? parseInt(formData.priority_id) : 1, // Default to "Baja" (1)
      category_id: formData.category_id && formData.category_id !== '' ? parseInt(formData.category_id) : 6, // Default to existing category (Personal = 6)
    };

    console.log('📤 FORM SUBMIT - Processed submitData:', JSON.stringify(submitData, null, 2));
    console.log('📤 FORM SUBMIT - Calling onSubmit with data');

    onSubmit(submitData);
  };

  const getPriorityColor = (priorityId) => {
    switch (priorityId) {
      case 1: return 'border-primary bg-primary/10';  // Baja
      case 2: return 'border-orange-500 bg-orange-50'; // Media - Naranja
      case 3: return 'border-red-500 bg-red-50';      // Alta - Roja
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className={isModal ? "" : "bg-white rounded-lg shadow-sm border p-6"}>
      {!isModal && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {task ? 'Editar Tarea' : 'Nueva Tarea'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <Label className="mb-2 block">Título *</Label>
          <Input
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Ingresa el título de la tarea"
            required
            className="bg-background"
          />
        </div>

        {/* Description */}
        <div>
          <Label className="mb-2 block">Descripción</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            placeholder="Describe la tarea (opcional)"
            className="bg-background"
          />
        </div>

        {/* Due Date */}
        <div>
          <Label className="mb-2 block">Fecha límite</Label>
          <Input
            type="date"
            value={formData.due_date}
            onInput={(e) => handleInputChange('due_date', e.target.value)}
            className="bg-background"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        {/* Quick date buttons */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToday}
            title="Establecer para hoy"
          >
            Hoy
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTomorrow}
            title="Establecer para mañana"
          >
            Mañana
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleWeekend}
            title="Establecer para el fin de semana"
          >
            Fin de semana
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
            title="Establecer para la próxima semana"
          >
            Próxima semana
          </Button>
        </div>

        {/* Priority and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Prioridad</Label>
            <Select
              value={formData.priority_id.toString()}
              onValueChange={(value) => handleInputChange('priority_id', parseInt(value))}
            >
              <SelectTrigger className={`w-full ${getPriorityColor(formData.priority_id)}`}>
                <SelectValue placeholder="Selecciona prioridad" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={`priority-${priority.id}`} value={priority.id.toString()}>
                    {priority.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Categoría</Label>
            <Select
              value={formData.category_id.toString()}
              onValueChange={(value) => handleInputChange('category_id', parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={`category-${category.id}`} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {task ? 'Actualizar' : 'Crear'} Tarea
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
