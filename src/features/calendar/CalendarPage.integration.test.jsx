import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CalendarPage from './CalendarPage';
import apiClient from '../../shared/api/client';

vi.mock('../../context/themeContext', () => ({
  useTheme: () => ({
    darkMode: false,
  }),
}));

vi.mock('../../shared/api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../../hooks/useEvents', () => ({
  useEvents: () => ({
    events: [
      {
        id: 1,
        title: 'Parcial Ingeniería de Software',
        start_date: '2026-06-20T09:00:00',
        type: 'Examen',
      },
      {
        id: 2,
        title: 'Entrega Proyecto',
        start_date: '2026-06-25T09:00:00',
        type: 'Entrega',
      },
    ],
    loading: false,
    error: null,
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
  }),
}));

vi.mock('./components/CalendarWeekView', () => ({
  default: () => <div>CalendarWeekView</div>,
}));

vi.mock('./components/CalendarDayView', () => ({
  default: () => <div>CalendarDayView</div>,
}));

vi.mock('./components/DayPanel', () => ({
  default: () => <div>DayPanel</div>,
}));

vi.mock('./components/EventFormModal', () => ({
  CreateEventModal: () => (
    <div>Modal Crear Evento</div>
  ),
  EditEventModal: () => (
    <div>Modal Editar Evento</div>
  ),
}));

vi.mock('./components/CalendarModals', () => ({
  TaskDetailsModal: () => <div />,
  EventDetailsModal: () => <div />,
  DeleteEventModal: () => <div />,
}));

describe('CalendarPage – Pruebas de Integración Calendario', () => {

  it('INT-CAL01 – Carga tareas y eventos correctamente', async () => {

    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 1,
            title: 'Tarea Integración',
          },
        ],
      },
    });

    render(<CalendarPage />);

    expect(
      await screen.findByText('Calendario')
    ).toBeInTheDocument();
  });

  it('INT-CAL02 – Muestra contador de eventos y tareas', async () => {

    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: [
          { id: 1, title: 'Tarea 1' },
        ],
      },
    });

    render(<CalendarPage />);

    expect(
      await screen.findByText(/2 Eventos/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/1 Tareas/i)
    ).toBeInTheDocument();
  });

  it('INT-CAL03 – Abre modal para crear evento', async () => {

    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: [],
      },
    });

    render(<CalendarPage />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: /nuevo evento/i,
      })
    );

    expect(
      await screen.findByText('Modal Crear Evento')
    ).toBeInTheDocument();
  });

  it('INT-CAL04 – Permite cambiar entre vista semana y mes', async () => {

    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: [],
      },
    });

    render(<CalendarPage />);

    fireEvent.click(await screen.findByText('Mes'));

    expect(
      screen.getByText('Hoy')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Semana'));

    expect(
      screen.getByText('CalendarWeekView')
    ).toBeInTheDocument();
  });

  it('INT-CAL05 – Muestra error cuando falla la carga de tareas', async () => {

    apiClient.get.mockRejectedValue(
      new Error('Network Error')
    );

    render(<CalendarPage />);

    expect(
      await screen.findByText(/error al cargar las tareas/i)
    ).toBeInTheDocument();
  });

});