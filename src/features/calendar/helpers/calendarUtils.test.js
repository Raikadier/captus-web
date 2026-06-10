import { describe, it, expect } from 'vitest';
import {
  getDaysInMonth,
  getPriorityColor,
  getEventColor,
  getEventBlockColor,
  getTaskBlockColor,
  MONTH_NAMES,
  DAY_NAMES_SHORT,
} from './calendarUtils';

describe('calendarUtils – Pruebas Unitarias Calendario Académico', () => {
  it('CAL01 – Retorna los 12 nombres de los meses', () => {
    expect(MONTH_NAMES).toHaveLength(12);
    expect(MONTH_NAMES[0]).toBe('Enero');
    expect(MONTH_NAMES[11]).toBe('Diciembre');
  });

  it('CAL02 – Retorna los 7 nombres cortos de los días', () => {
    expect(DAY_NAMES_SHORT).toHaveLength(7);
    expect(DAY_NAMES_SHORT).toEqual(['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']);
  });

  it('CAL03 – Genera correctamente los días de un mes de 31 días', () => {
    const days = getDaysInMonth(new Date(2026, 0, 1)); // Enero 2026
    const validDays = days.filter(Boolean);

    expect(validDays).toHaveLength(31);
    expect(validDays[0].getDate()).toBe(1);
    expect(validDays[30].getDate()).toBe(31);
  });

  it('CAL04 – Genera correctamente febrero de un año no bisiesto', () => {
    const days = getDaysInMonth(new Date(2026, 1, 1)); // Febrero 2026
    const validDays = days.filter(Boolean);

    expect(validDays).toHaveLength(28);
  });

  it('CAL05 – Genera correctamente febrero de un año bisiesto', () => {
    const days = getDaysInMonth(new Date(2024, 1, 1)); // Febrero 2024
    const validDays = days.filter(Boolean);

    expect(validDays).toHaveLength(29);
  });

  it('CAL06 – Retorna color para prioridad alta, media y baja numérica', () => {
    expect(getPriorityColor(3)).toContain('red');
    expect(getPriorityColor(2)).toContain('yellow');
    expect(getPriorityColor(1)).toContain('green');
  });

  it('CAL07 – Retorna color por defecto para prioridad inválida', () => {
    expect(getPriorityColor(99)).toContain('gray');
  });

  it('CAL08 – Retorna color según tipo de evento', () => {
    expect(getEventColor('Examen')).toContain('red');
    expect(getEventColor('Entrega')).toContain('orange');
    expect(getEventColor('Clase')).toContain('blue');
  });

  it('CAL09 – Retorna color por defecto para evento desconocido', () => {
    expect(getEventColor('Otro')).toContain('indigo');
  });

  it('CAL10 – Retorna bloque de color para eventos específicos', () => {
    expect(getEventBlockColor('Examen').bg).toBe('bg-[#E67C73]');
    expect(getEventBlockColor('Entrega').bg).toBe('bg-[#F4511E]');
    expect(getEventBlockColor('Clase').bg).toBe('bg-[#039BE5]');
    expect(getEventBlockColor('Reunión').bg).toBe('bg-[#8E24AA]');
  });

  it('CAL11 – Retorna bloque de color alternativo para evento desconocido', () => {
    expect(getEventBlockColor('Otro', 1).bg).toBe('bg-[#7CB342]');
  });

  it('CAL12 – Retorna color de tarea según prioridad', () => {
    expect(getTaskBlockColor(3).bg).toBe('bg-[#E67C73]');
    expect(getTaskBlockColor(2).bg).toBe('bg-[#D4AC0D]');
    expect(getTaskBlockColor(1).bg).toBe('bg-[#33B679]');
  });

  it('CAL13 – Retorna color por defecto para prioridad de tarea inválida', () => {
    expect(getTaskBlockColor(99).bg).toBe('bg-[#9E9E9E]');
  });
});