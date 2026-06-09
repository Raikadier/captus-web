import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEvents } from './useEvents';
import apiClient from '../shared/api/client';

vi.mock('../shared/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('useEvents – Pruebas de Integración Gestión de Eventos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('INT-EVT01 – Carga eventos correctamente desde la API', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: [
          { id: 1, title: 'Parcial de Software', type: 'Examen' },
          { id: 2, title: 'Entrega CAPTUS', type: 'Entrega' },
        ],
      },
    });

    const { result } = renderHook(() => useEvents());

    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
    });

    expect(apiClient.get).toHaveBeenCalledWith('/events');
    expect(result.current.events[0].title).toBe('Parcial de Software');
  });

  it('INT-EVT02 – Maneja error cuando falla la carga de eventos', async () => {
    apiClient.get.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useEvents());

    await waitFor(() => {
      expect(result.current.error).toBe('Error al cargar los eventos');
    });

    expect(result.current.events).toEqual([]);
  });

  it('INT-EVT03 – Crea un evento y refresca la lista', async () => {
    apiClient.get.mockResolvedValue({
      data: { success: true, data: [] },
    });

    apiClient.post.mockResolvedValue({
      data: {
        success: true,
        data: { id: 3, title: 'Clase de Bases de Datos' },
      },
    });

    const { result } = renderHook(() => useEvents());

    await act(async () => {
      const response = await result.current.createEvent({
        title: 'Clase de Bases de Datos',
        type: 'Clase',
      });

      expect(response.success).toBe(true);
    });

    expect(apiClient.post).toHaveBeenCalledWith('/events', {
      title: 'Clase de Bases de Datos',
      type: 'Clase',
    });

    expect(apiClient.get).toHaveBeenCalled();
  });

  it('INT-EVT04 – Retorna error si la creación del evento falla', async () => {
    apiClient.get.mockResolvedValue({
      data: { success: true, data: [] },
    });

    apiClient.post.mockRejectedValue(new Error('Server Error'));

    const { result } = renderHook(() => useEvents());

    let response;

    await act(async () => {
      response = await result.current.createEvent({
        title: 'Evento fallido',
      });
    });

    expect(response.success).toBe(false);
    expect(response.message).toBe('Error al crear el evento');
  });

  it('INT-EVT05 – Actualiza un evento existente y refresca la lista', async () => {
    apiClient.get.mockResolvedValue({
      data: { success: true, data: [] },
    });

    apiClient.put.mockResolvedValue({
      data: {
        success: true,
        data: { id: 5, title: 'Evento actualizado' },
      },
    });

    const { result } = renderHook(() => useEvents());

    await act(async () => {
      const response = await result.current.updateEvent(5, {
        title: 'Evento actualizado',
      });

      expect(response.success).toBe(true);
    });

    expect(apiClient.put).toHaveBeenCalledWith('/events/5', {
      title: 'Evento actualizado',
    });
  });

  it('INT-EVT06 – Elimina un evento y refresca la lista', async () => {
    apiClient.get.mockResolvedValue({
      data: { success: true, data: [] },
    });

    apiClient.delete.mockResolvedValue({
      data: { success: true },
    });

    const { result } = renderHook(() => useEvents());

    await act(async () => {
      const response = await result.current.deleteEvent(7);
      expect(response.success).toBe(true);
    });

    expect(apiClient.delete).toHaveBeenCalledWith('/events/7');
  });
});