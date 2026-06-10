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

  it('INT-SUB01 – Carga materias desde la API al abrir el diálogo', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        data: [
          { id: 1, name: 'Matemáticas', grade: 4.5, color: 'blue' },
          { id: 2, name: 'Programación', grade: 4.8, color: 'green' },
        ],
      },
    });

    render(<ManageSubjectsDialog onUpdate={mockOnUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    expect(await screen.findByText('Matemáticas')).toBeInTheDocument();
    expect(await screen.findByText('Programación')).toBeInTheDocument();

    expect(apiClient.get).toHaveBeenCalledWith('/subjects');
  });

  it('INT-SUB02 – Muestra mensaje cuando no existen materias', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        data: [],
      },
    });

    render(<ManageSubjectsDialog onUpdate={mockOnUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    expect(
      await screen.findByText(/no hay materias registradas/i)
    ).toBeInTheDocument();
  });

  it('INT-SUB03 – Crea materia correctamente mediante la API', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        data: [],
      },
    });

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

    fireEvent.change(screen.getByPlaceholderText('0.0'), {
      target: { value: '4.7' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear materia/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/subjects', {
        name: 'Bases de Datos',
        grade: 4.7,
        progress: 0,
        color: 'blue',
      });
    });
  });

  it('INT-SUB04 – Muestra error cuando la API falla al crear materia', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        data: [],
      },
    });

    apiClient.post.mockRejectedValue({
      response: {
        data: {
          error: 'No tienes permisos para crear materias',
        },
      },
    });

    render(<ManageSubjectsDialog onUpdate={mockOnUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    fireEvent.change(await screen.findByPlaceholderText('Ej: Matemáticas'), {
      target: { value: 'Redes' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear materia/i }));

    expect(
      await screen.findByText(/no tienes permisos para crear materias/i)
    ).toBeInTheDocument();
  });

  it('INT-SUB05 – Refresca la lista después de crear una materia', async () => {
    apiClient.get
      .mockResolvedValueOnce({
        data: {
          data: [],
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 10,
              name: 'Arquitectura de Software',
              grade: 4.9,
              color: 'purple',
            },
          ],
        },
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

    fireEvent.click(screen.getByRole('button', { name: /crear materia/i }));

    expect(
      await screen.findByText('Arquitectura de Software')
    ).toBeInTheDocument();
  });

  it('INT-SUB06 – No crea materia cuando el nombre está vacío', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        data: [],
      },
    });

    render(<ManageSubjectsDialog onUpdate={mockOnUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /materias/i }));

    fireEvent.click(screen.getByRole('button', { name: /crear materia/i }));

    expect(apiClient.post).not.toHaveBeenCalled();
  });
});