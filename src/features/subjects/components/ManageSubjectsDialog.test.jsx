import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManageSubjectsDialog } from './ManageSubjectsDialog';
import apiClient from '../../../shared/api/client';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      user_metadata: { role: 'teacher' },
      app_metadata: {},
    },
  }),
}));

vi.mock('../../../shared/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('ManageSubjectsDialog – Pruebas Unitarias Gestión de Materias', () => {
  const onUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SUB01 – Muestra el botón Materias', () => {
    render(<ManageSubjectsDialog onUpdate={onUpdate} />);

    expect(screen.getByRole('button', { name: /materias/i })).toBeInTheDocument();
  });

  it('SUB02 – Abre el diálogo de gestión académica', async () => {
    apiClient.get.mockResolvedValue({ data: [] });

    render(<ManageSubjectsDialog onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    expect(await screen.findByText('Gestión Académica')).toBeInTheDocument();
    expect(screen.getByText('Nuevo Curso')).toBeInTheDocument();
  });

  it('SUB03 – Muestra mensaje cuando no hay cursos', async () => {
    apiClient.get.mockResolvedValue({ data: [] });

    render(<ManageSubjectsDialog onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    expect(await screen.findByText(/no tienes cursos creados/i)).toBeInTheDocument();
  });

  it('SUB04 – Lista cursos existentes', async () => {
    apiClient.get.mockResolvedValue({
      data: [
        { id: 1, title: 'Matemáticas', grade: 4.5, color: 'blue' },
        { id: 2, title: 'Ingeniería de Software', grade: 4.8, color: 'green' },
      ],
    });

    render(<ManageSubjectsDialog onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    expect(await screen.findByText('Matemáticas')).toBeInTheDocument();
    expect(screen.getByText('Ingeniería de Software')).toBeInTheDocument();
    expect(screen.getByText('Cursos (2)')).toBeInTheDocument();
  });

  it('SUB05 – Crea un curso con datos válidos', async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    apiClient.post.mockResolvedValue({ data: { success: true } });

    render(<ManageSubjectsDialog onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    fireEvent.change(await screen.findByLabelText('Nombre del curso'), {
      target: { value: 'Bases de Datos' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear curso/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/courses', {
        title: 'Bases de Datos',
        description: '',
      });
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it('SUB06 – No crea curso si el nombre está vacío', async () => {
    apiClient.get.mockResolvedValue({ data: [] });

    render(<ManageSubjectsDialog onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    fireEvent.click(await screen.findByRole('button', { name: /crear curso/i }));

    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('SUB07 – Muestra progreso cuando no hay promedio', async () => {
    apiClient.get.mockResolvedValue({
      data: [{ id: 1, title: 'Programación', progress: 75, color: '#3b82f6' }],
    });

    render(<ManageSubjectsDialog onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    expect(await screen.findByText('Programación')).toBeInTheDocument();
    expect(screen.getByText(/75%/)).toBeInTheDocument();
  });

  it('SUB08 – Muestra mensaje de error si falla la creación', async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    apiClient.post.mockRejectedValue({
      response: { data: { error: 'No tienes permisos para crear cursos' } },
    });

    render(<ManageSubjectsDialog onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    fireEvent.change(await screen.findByLabelText('Nombre del curso'), {
      target: { value: 'Física' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear curso/i }));

    expect(await screen.findByText('No tienes permisos para crear cursos')).toBeInTheDocument();
  });
});
