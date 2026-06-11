// @vitest-environment node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PRUEBA UNITARIA  PU02 – Calculador de Progreso
 * Proyecto: Captus – Plataforma Web para la Gestión Académica Inteligente
 * Módulo:   src/lib/progressCalculator.js
 *
 * Técnicas aplicadas:
 *   • Caja Negra  – Clases de Equivalencia (CV / CI)
 *   • Caja Negra  – Valores Límite (VL)
 *   • Caja Blanca – Camino básico (cubre todas las ramas de calcularProgreso)
 *
 * Clases de Equivalencia definidas:
 *   CE1 (CV) – 0 < completadas < total              → porcentaje parcial
 *   CE2 (CV) – completadas = total                  → 100 %
 *   CE3 (CV) – completadas = 0                      → 0 %
 *   CE4 (CI) – total = 0                            → 0 % (sin división por cero)
 *   CE5 (CI) – completadas < 0                      → 0 % (valor inválido)
 *   CE6 (CI) – completadas > total                  → 100 % (capped)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { describe, it, expect } from 'vitest';
import { calcularProgreso, calcularProgresoSubtareas, calcularTasaCumplimientoSemanal, calcularDistribucionPorcentual, calcularEstadoGeneralTareas } from '../progressCalculator';

describe('PU02 – Calculador de Progreso (progressCalculator)', () => {
  // ─── Clases Válidas ────────────────────────────────────────────────────────

  it('PU02-CV01 | CE1 | 3 de 5 tareas completadas → 60 %', () => {
    // Caso exacto del documento académico: PU02
    expect(calcularProgreso(3, 5)).toBe(60);
  });

  it('PU02-CV02 | CE1 | 1 de 4 tareas completadas → 25 %', () => {
    expect(calcularProgreso(1, 4)).toBe(25);
  });

  it('PU02-CV03 | CE1 | 7 de 10 tareas completadas → 70 %', () => {
    expect(calcularProgreso(7, 10)).toBe(70);
  });

  it('PU02-CV04 | CE2 | Todas las tareas completadas → 100 %', () => {
    expect(calcularProgreso(5, 5)).toBe(100);
    expect(calcularProgreso(1, 1)).toBe(100);
  });

  it('PU02-CV05 | CE3 | Ninguna tarea completada → 0 %', () => {
    expect(calcularProgreso(0, 5)).toBe(0);
    expect(calcularProgreso(0, 1)).toBe(0);
  });

  // ─── Clases Inválidas ──────────────────────────────────────────────────────

  it('PU02-CI01 | CE4 | Total = 0 → 0 % (sin división por cero)', () => {
    expect(calcularProgreso(0, 0)).toBe(0);
    expect(calcularProgreso(3, 0)).toBe(0);
  });

  it('PU02-CI02 | CE5 | Completadas negativas → 0 % (valor inválido)', () => {
    expect(calcularProgreso(-1, 5)).toBe(0);
    expect(calcularProgreso(-10, 5)).toBe(0);
  });

  it('PU02-CI03 | CE6 | Completadas > total → 100 % (cap)', () => {
    expect(calcularProgreso(6, 5)).toBe(100);
    expect(calcularProgreso(100, 5)).toBe(100);
  });

  // ─── Valores Límite ────────────────────────────────────────────────────────

  it('PU02-VL01 | VL | total = 1, completadas = 0 → 0 %', () => {
    expect(calcularProgreso(0, 1)).toBe(0);
  });

  it('PU02-VL02 | VL | total = 1, completadas = 1 → 100 %', () => {
    expect(calcularProgreso(1, 1)).toBe(100);
  });

  it('PU02-VL03 | VL | redondeo: 1 de 3 → 33 %', () => {
    expect(calcularProgreso(1, 3)).toBe(33);
  });

  it('PU02-VL04 | VL | redondeo: 2 de 3 → 67 %', () => {
    expect(calcularProgreso(2, 3)).toBe(67);
  });

  // ─── Camino Básico (Caja Blanca) ──────────────────────────────────────────
  // Cubre las 4 ramas de calcularProgreso: total<=0 / completadas<0 /
  //   completadas>total / cálculo normal

  it('PU02-CB01 | CB | Rama: total ≤ 0 → retorna 0 sin operar', () => {
    expect(calcularProgreso(5, 0)).toBe(0);
    expect(calcularProgreso(0, -1)).toBe(0);
  });

  it('PU02-CB02 | CB | Rama: completadas < 0 → retorna 0', () => {
    expect(calcularProgreso(-3, 10)).toBe(0);
  });

  it('PU02-CB03 | CB | Rama: completadas > total → retorna 100 (cap)', () => {
    expect(calcularProgreso(10, 5)).toBe(100);
  });

  it('PU02-CB04 | CB | Rama normal: cálculo y redondeo correctos', () => {
    expect(calcularProgreso(3, 5)).toBe(60);
  });

  // ─── calcularProgresoSubtareas ─────────────────────────────────────────────

  describe('calcularProgresoSubtareas – desde array de subtareas', () => {
    it('PU02-ST01 | Array vacío → 0 %', () => {
      expect(calcularProgresoSubtareas([])).toBe(0);
      expect(calcularProgresoSubtareas(null)).toBe(0);
    });

    it('PU02-ST02 | 3 de 5 subtareas con state=true → 60 %', () => {
      const subtareas = [
        { state: true },
        { state: true },
        { state: true },
        { state: false },
        { state: false },
      ];
      expect(calcularProgresoSubtareas(subtareas)).toBe(60);
    });

    it('PU02-ST03 | Todas completadas → 100 %', () => {
      const subtareas = [{ state: true }, { state: true }, { state: true }];
      expect(calcularProgresoSubtareas(subtareas)).toBe(100);
    });

    it('PU02-ST04 | Ninguna completada → 0 %', () => {
      const subtareas = [{ state: false }, { state: false }];
      expect(calcularProgresoSubtareas(subtareas)).toBe(0);
    });

    it('PU02-ST05 | Ignora campos distintos de state', () => {
      const subtareas = [
        { state: true, title: 'A', id_SubTask: 1 },
        { state: false, title: 'B', id_SubTask: 2 },
      ];
      expect(calcularProgresoSubtareas(subtareas)).toBe(50);
    });
  });

  describe('calcularTasaCumplimientoSemanal – tasa semanal de tareas', () => {
    it('PU02-WS01 | Más completadas que creadas → 100 %', () => {
      const chart = [
        { day: 'Lun', created: 2, completed: 5 },
        { day: 'Mar', created: 3, completed: 7 },
      ];
      expect(calcularTasaCumplimientoSemanal(chart, 220)).toBe(100);
    });

    it('PU02-WS02 | Calcula porcentaje normal desde el gráfico', () => {
      const chart = [
        { day: 'Lun', created: 4, completed: 2 },
        { day: 'Mar', created: 6, completed: 3 },
      ];
      expect(calcularTasaCumplimientoSemanal(chart)).toBe(50);
    });

    it('PU02-WS03 | Sin gráfico limita el fallback del backend a 100 %', () => {
      expect(calcularTasaCumplimientoSemanal([], 220)).toBe(100);
      expect(calcularTasaCumplimientoSemanal(null, 75)).toBe(75);
    });
  });

  describe('calcularDistribucionPorcentual – porcentajes de gráficos', () => {
    it('PU02-DP01 | Los porcentajes siempre suman 100', () => {
      const result = calcularDistribucionPorcentual([
        { name: 'Completadas', value: 100, color: '#22c55e' },
        { name: 'Expiradas', value: 23, color: '#ef4444' },
      ]);

      expect(result).toHaveLength(2);
      expect(result[0].percentage).toBe(81);
      expect(result[1].percentage).toBe(19);
      expect(result.reduce((sum, item) => sum + item.percentage, 0)).toBe(100);
    });
  });

  describe('calcularEstadoGeneralTareas – estado general de tareas', () => {
    it('PU02-EG01 | Usa totalTasks y expiredTasks del API', () => {
      const result = calcularEstadoGeneralTareas({
        completedTasks: 100,
        totalTasks: 40,
        expiredTasks: 23,
      });

      const pending = result.find((item) => item.name === 'Pendientes');
      const expired = result.find((item) => item.name === 'Expiradas');

      expect(pending?.value).toBe(17);
      expect(expired?.value).toBe(23);
      expect(result.reduce((sum, item) => sum + item.percentage, 0)).toBe(100);
    });
  });
});
