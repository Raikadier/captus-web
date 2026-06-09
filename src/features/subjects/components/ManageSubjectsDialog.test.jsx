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
    apiClient.get.mockResolvedValue({ data: { data: [] } });

    render(<ManageSubjectsDialog onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    expect(await screen.findByText('Gestión Académica')).toBeInTheDocument();
    expect(screen.getByText('Nueva Materia')).toBeInTheDocument();
  });

  it('SUB03 – Muestra mensaje cuando no hay materias registradas', async () => {
    apiClient.get.mockResolvedValue({ data: { data: [] } });

    render(<ManageSubjectsDialog onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    expect(await screen.findByText('No hay materias registradas.')).toBeInTheDocument();
  });

  it('SUB04 – Lista materias existentes', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        data: [
          { id: 1, name: 'Matemáticas', grade: 4.5, color: 'blue' },
          { id: 2, name: 'Ingeniería de Software', grade: 4.8, color: 'green' },
        ],
      },
    });

    render(<ManageSubjectsDialog onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    expect(await screen.findByText('Matemáticas')).toBeInTheDocument();
    expect(screen.getByText('Ingeniería de Software')).toBeInTheDocument();
    expect(screen.getByText('Materias Activas (2)')).toBeInTheDocument();
  });

  it('SUB05 – Crea una materia con datos válidos', async () => {
    apiClient.get.mockResolvedValue({ data: { data: [] } });
    apiClient.post.mockResolvedValue({ data: { success: true } });

    render(<ManageSubjectsDialog onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    fireEvent.change(await screen.findByLabelText('Nombre'), {
      target: { value: 'Bases de Datos' },
    });

    fireEvent.change(screen.getByLabelText('Promedio'), {
      target: { value: '4.2' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear materia/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/subjects', {
        name: 'Bases de Datos',
        grade: 4.2,
        progress: 0,
        color: 'blue',
      });
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it('SUB06 – No crea materia si el nombre está vacío', async () => {
    apiClient.get.mockResolvedValue({ data: { data: [] } });

    render(<ManageSubjectsDialog onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    fireEvent.click(await screen.findByRole('button', { name: /crear materia/i }));

    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('SUB07 – Permite seleccionar color para la materia', async () => {
    apiClient.get.mockResolvedValue({ data: { data: [] } });
    apiClient.post.mockResolvedValue({ data: { success: true } });

    render(<ManageSubjectsDialog onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    fireEvent.change(await screen.findByLabelText('Nombre'), {
      target: { value: 'Programación' },
    });

    fireEvent.click(screen.getByTitle('Green'));
    fireEvent.click(screen.getByRole('button', { name: /crear materia/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/subjects', expect.objectContaining({
        name: 'Programación',
        color: 'green',
      }));
    });
  });

  it('SUB08 – Muestra mensaje de error si falla la creación', async () => {
    apiClient.get.mockResolvedValue({ data: { data: [] } });
    apiClient.post.mockRejectedValue({
      response: { data: { error: 'No tienes permisos para crear materias' } },
    });

    render(<ManageSubjectsDialog onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    fireEvent.change(await screen.findByLabelText('Nombre'), {
      target: { value: 'Física' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear materia/i }));

    expect(await screen.findByText('No tienes permisos para crear materias')).toBeInTheDocument();
  });
});     