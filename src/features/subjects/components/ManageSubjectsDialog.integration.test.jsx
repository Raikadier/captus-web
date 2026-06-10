import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManageSubjectsDialog } from './ManageSubjectsDialog';
import apiClient from '../../../shared/api/client';

const mockOnUpdate = vi.fn();

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      user_metadata: {
        role: 'teacher',
      },
    },
  }),
}));

vi.mock('../../../shared/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('ManageSubjectsDialog – Pruebas de Integración Gestión de Materias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('INT-SUB01 – Carga cursos desde la API al abrir el diálogo', async () => {
    apiClient.get.mockResolvedValue({
      data: [
        { id: 1, title: 'Matemáticas', grade: 4.5, color: 'blue' },
        { id: 2, title: 'Programación', grade: 4.8, color: 'green' },
      ],
    });

    render(<ManageSubjectsDialog onUpdate={mockOnUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    expect(await screen.findByText('Matemáticas')).toBeInTheDocument();
    expect(await screen.findByText('Programación')).toBeInTheDocument();

    expect(apiClient.get).toHaveBeenCalledWith('/courses/teacher');
  });

  it('INT-SUB02 – Muestra mensaje cuando no existen cursos', async () => {
    apiClient.get.mockResolvedValue({ data: [] });

    render(<ManageSubjectsDialog onUpdate={mockOnUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    expect(
      await screen.findByText(/no tienes cursos creados/i)
    ).toBeInTheDocument();
  });

  it('INT-SUB03 – Crea curso correctamente mediante la API', async () => {
    apiClient.get.mockResolvedValue({ data: [] });

    apiClient.post.mockResolvedValue({
      data: {
        success: true,
      },
    });

    render(<ManageSubjectsDialog onUpdate={mockOnUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    fireEvent.change(await screen.findByPlaceholderText('Ej: Matemáticas'), {
      target: { value: 'Bases de Datos' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear curso/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/courses', {
        title: 'Bases de Datos',
        description: '',
      });
    });
  });

  it('INT-SUB04 – Muestra error cuando la API falla al crear curso', async () => {
    apiClient.get.mockResolvedValue({ data: [] });

    apiClient.post.mockRejectedValue({
      response: {
        data: {
          error: 'No tienes permisos para crear cursos',
        },
      },
    });

    render(<ManageSubjectsDialog onUpdate={mockOnUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    fireEvent.change(await screen.findByPlaceholderText('Ej: Matemáticas'), {
      target: { value: 'Redes' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear curso/i }));

    expect(
      await screen.findByText(/no tienes permisos para crear cursos/i)
    ).toBeInTheDocument();
  });

  it('INT-SUB05 – Refresca la lista después de crear un curso', async () => {
    apiClient.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [
          {
            id: 10,
            title: 'Arquitectura de Software',
            grade: 4.9,
            color: 'purple',
          },
        ],
      });

    apiClient.post.mockResolvedValue({
      data: {
        success: true,
      },
    });

    render(<ManageSubjectsDialog onUpdate={mockOnUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    fireEvent.change(await screen.findByPlaceholderText('Ej: Matemáticas'), {
      target: { value: 'Arquitectura de Software' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear curso/i }));

    expect(
      await screen.findByText('Arquitectura de Software')
    ).toBeInTheDocument();
  });

  it('INT-SUB06 – No crea curso cuando el nombre está vacío', async () => {
    apiClient.get.mockResolvedValue({ data: [] });

    render(<ManageSubjectsDialog onUpdate={mockOnUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    fireEvent.click(screen.getByRole('button', { name: /crear curso/i }));

    expect(apiClient.post).not.toHaveBeenCalled();
  });
});
