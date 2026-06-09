import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskForm from './TaskForm';

const categories = [
  { id: 6, name: 'Personal' },
  { id: 7, name: 'Académica' },
];

const priorities = [
  { id: 1, name: 'Baja' },
  { id: 2, name: 'Media' },
  { id: 3, name: 'Alta' },
];

describe('TaskForm – Pruebas Unitarias Gestión de Tareas', () => {
  let onSubmit;
  let onCancel;

  beforeEach(() => {
    onSubmit = vi.fn();
    onCancel = vi.fn();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('TSK01 – Crea tarea con datos válidos', () => {
    render(
      <TaskForm
        categories={categories}
        priorities={priorities}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Ingresa el título de la tarea'), {
      target: { value: 'Estudiar para parcial' },
    });

    fireEvent.change(screen.getByPlaceholderText('Describe la tarea (opcional)'), {
      target: { value: 'Repasar temas de ingeniería de software' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /crear tarea/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Estudiar para parcial',
        description: 'Repasar temas de ingeniería de software',
        priority_id: 1,
        category_id: 6,
      })
    );
  });

  it('TSK02 – No permite crear tarea con título vacío', () => {
    render(
      <TaskForm
        categories={categories}
        priorities={priorities}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    fireEvent.submit(screen.getByRole('button', { name: /crear tarea/i }));

    expect(window.alert).toHaveBeenCalledWith('El título es obligatorio');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('TSK03 – Muestra error cuando la fecha límite es anterior a hoy', () => {
    render(
      <TaskForm
        categories={categories}
        priorities={priorities}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Ingresa el título de la tarea'), {
      target: { value: 'Tarea vencida' },
    });

    fireEvent.input(screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/), {
      target: { value: '2020-01-01' },
    });

    expect(
      screen.getByText('La fecha límite no puede ser anterior a hoy. Selecciona una fecha actual o futura.')
    ).toBeInTheDocument();
  });

  it('TSK04 – No envía tarea si existe error de fecha', () => {
    render(
      <TaskForm
        categories={categories}
        priorities={priorities}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Ingresa el título de la tarea'), {
      target: { value: 'Tarea con fecha inválida' },
    });

    fireEvent.input(screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/), {
      target: { value: '2020-01-01' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /crear tarea/i }));

    expect(window.alert).toHaveBeenCalledWith(
      'La fecha límite no puede ser anterior a hoy. Selecciona una fecha actual o futura.'
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('TSK05 – Botón Hoy asigna la fecha actual', () => {
    render(
      <TaskForm
        categories={categories}
        priorities={priorities}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    const today = new Date().toISOString().split('T')[0];

    fireEvent.click(screen.getByRole('button', { name: /hoy/i }));

    expect(screen.getByDisplayValue(today)).toBeInTheDocument();
  });

  it('TSK06 – Botón Mañana asigna la fecha del día siguiente', () => {
    render(
      <TaskForm
        categories={categories}
        priorities={priorities}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const expectedDate = tomorrow.toISOString().split('T')[0];

    fireEvent.click(screen.getByRole('button', { name: /mañana/i }));

    expect(screen.getByDisplayValue(expectedDate)).toBeInTheDocument();
  });

  it('TSK07 – Carga datos cuando se edita una tarea existente', () => {
    const task = {
      title: 'Tarea existente',
      description: 'Descripción existente',
      due_date: '2026-06-20T00:00:00',
      priority_id: 2,
      category_id: 7,
    };

    render(
      <TaskForm
        task={task}
        categories={categories}
        priorities={priorities}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    expect(screen.getByDisplayValue('Tarea existente')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Descripción existente')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-06-20')).toBeInTheDocument();
  });

  it('TSK08 – Ejecuta onCancel al presionar Cancelar', () => {
    render(
      <TaskForm
        categories={categories}
        priorities={priorities}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});