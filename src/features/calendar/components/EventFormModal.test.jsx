import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateEventModal, EditEventModal } from './EventFormModal';

describe('EventFormModal – Pruebas Unitarias Gestión de Eventos', () => {
  let onClose;
  let onCreate;
  let onUpdate;

  beforeEach(() => {
    onClose = vi.fn();
    onCreate = vi.fn().mockResolvedValue({});
    onUpdate = vi.fn().mockResolvedValue({});
  });

  it('EVT01 – Muestra el formulario para crear evento', () => {
    render(
      <CreateEventModal
        onClose={onClose}
        onCreate={onCreate}
        selectedDate={new Date('2026-06-10')}
      />
    );

    expect(screen.getByText('Nuevo Evento')).toBeInTheDocument();
    expect(screen.getByText('Crea un evento en tu calendario')).toBeInTheDocument();
  });

  it('EVT02 – Crea evento con datos válidos', async () => {
    render(
      <CreateEventModal
        onClose={onClose}
        onCreate={onCreate}
        selectedDate={new Date('2026-06-10')}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Título del evento'), {
      target: { value: 'Parcial de Software' },
    });

    fireEvent.change(screen.getByPlaceholderText('Describe tu evento...'), {
      target: { value: 'Evaluación del segundo corte' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear evento/i }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Parcial de Software',
          description: 'Evaluación del segundo corte',
          end_date: null,
          type: 'Reunión',
          notify: false,
        })
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('EVT03 – No permite crear evento sin título', () => {
    render(
      <CreateEventModal
        onClose={onClose}
        onCreate={onCreate}
        selectedDate={new Date('2026-06-10')}
      />
    );

    const button = screen.getByRole('button', { name: /crear evento/i });

    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(onCreate).not.toHaveBeenCalled();
  });

  it('EVT04 – No permite crear evento sin fecha', () => {
    render(
      <CreateEventModal
        onClose={onClose}
        onCreate={onCreate}
        selectedDate={null}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Título del evento'), {
      target: { value: 'Clase de investigación' },
    });

    const button = screen.getByRole('button', { name: /crear evento/i });

    expect(button).toBeDisabled();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('EVT05 – Permite cambiar el tipo de evento', async () => {
    render(
      <CreateEventModal
        onClose={onClose}
        onCreate={onCreate}
        selectedDate={new Date('2026-06-10')}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Título del evento'), {
      target: { value: 'Entrega de proyecto' },
    });

    fireEvent.change(screen.getByDisplayValue('Reunión'), {
      target: { value: 'Entrega' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear evento/i }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Entrega de proyecto',
          type: 'Entrega',
        })
      );
    });
  });

  it('EVT06 – Ejecuta onClose al presionar Cancelar', () => {
    render(
      <CreateEventModal
        onClose={onClose}
        onCreate={onCreate}
        selectedDate={new Date('2026-06-10')}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('EVT07 – Carga datos de evento existente en modo edición', () => {
    const event = {
      id: 10,
      title: 'Clase de bases de datos',
      description: 'Tema: consultas SQL',
      start_date: '2026-06-12T09:00:00.000Z',
      type: 'Clase',
      notify: true,
    };

    render(
      <EditEventModal
        onClose={onClose}
        onUpdate={onUpdate}
        event={event}
      />
    );

    expect(screen.getByText('Editar Evento')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Clase de bases de datos')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tema: consultas SQL')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Clase')).toBeInTheDocument();
  });

  it('EVT08 – Actualiza evento existente con datos válidos', async () => {
    const event = {
      id: 10,
      title: 'Clase de bases de datos',
      description: 'Tema: consultas SQL',
      start_date: '2026-06-12T09:00:00.000Z',
      type: 'Clase',
      notify: false,
    };

    render(
      <EditEventModal
        onClose={onClose}
        onUpdate={onUpdate}
        event={event}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Título del evento'), {
      target: { value: 'Clase actualizada' },
    });

    fireEvent.click(screen.getByRole('button', { name: /actualizar evento/i }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(
        10,
        expect.objectContaining({
          title: 'Clase actualizada',
          description: 'Tema: consultas SQL',
          end_date: null,
          type: 'Clase',
          notify: false,
        })
      );
      expect(onClose).toHaveBeenCalled();
    });
  });
});