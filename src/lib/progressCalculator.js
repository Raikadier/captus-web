/**
 * progressCalculator.js
 * Captus – Módulo de cálculo de progreso académico
 *
 * Centraliza la lógica de porcentaje de completitud extraída de useSubTasks.js
 * para permitir pruebas unitarias puras sin dependencias de React ni del API.
 *
 * Usado por: useSubTasks (subtareas), StatsPage (estadísticas generales).
 */

/**
 * Calcula el porcentaje de progreso dado un número de ítems completados
 * sobre un total.
 *
 * @param {number} completadas - Cantidad de ítems completados (≥ 0).
 * @param {number} total       - Cantidad total de ítems (≥ 0).
 * @returns {number} Porcentaje redondeado al entero más cercano (0–100).
 *
 * @example
 * calcularProgreso(3, 5)  // → 60
 * calcularProgreso(0, 5)  // → 0
 * calcularProgreso(5, 5)  // → 100
 * calcularProgreso(0, 0)  // → 0   (sin tareas = sin progreso)
 */
export function calcularProgreso(completadas, total) {
  if (total <= 0) return 0;
  if (completadas < 0) return 0;
  if (completadas > total) return 100;
  return Math.round((completadas / total) * 100);
}

/**
 * Calcula el progreso directamente desde un array de subtareas,
 * usando el campo `state` (mismo modelo que useSubTasks.js).
 *
 * @param {Array<{ state: boolean }>} subtareas - Array de subtareas.
 * @returns {number} Porcentaje de subtareas completadas (0–100).
 */
export function calcularProgresoSubtareas(subtareas) {
  if (!Array.isArray(subtareas) || subtareas.length === 0) return 0;
  const completadas = subtareas.filter((st) => st.state === true).length;
  return calcularProgreso(completadas, subtareas.length);
}

/**
 * Calcula la tasa de cumplimiento semanal a partir del gráfico de productividad.
 * Evita porcentajes > 100 cuando se completan tareas de semanas anteriores.
 *
 * @param {Array<{ created?: number, completed?: number }>} productivityChart
 * @param {number} fallbackRate - Valor del backend si no hay datos del gráfico.
 * @returns {number} Porcentaje de cumplimiento (0–100).
 */
export function calcularTasaCumplimientoSemanal(productivityChart, fallbackRate = 0) {
  if (Array.isArray(productivityChart) && productivityChart.length > 0) {
    const created = productivityChart.reduce((sum, day) => sum + (day.created || 0), 0);
    const completed = productivityChart.reduce((sum, day) => sum + (day.completed || 0), 0);
    return calcularProgreso(completed, created);
  }

  const rate = Number(fallbackRate) || 0;
  return Math.min(100, Math.max(0, rate));
}

/**
 * Convierte segmentos con valores absolutos en porcentajes que suman 100.
 *
 * @param {Array<{ name: string, value: number, color: string }>} segments
 * @returns {Array<{ name: string, value: number, color: string, percentage: number }>}
 */
export function calcularDistribucionPorcentual(segments) {
  const items = (segments || []).filter((segment) => (segment.value || 0) > 0);
  const total = items.reduce((sum, segment) => sum + segment.value, 0);

  if (total <= 0) return [];

  const withPercentage = items.map((segment) => ({
    ...segment,
    percentage: Math.round((segment.value / total) * 100),
  }));

  const percentageSum = withPercentage.reduce((sum, segment) => sum + segment.percentage, 0);
  if (percentageSum !== 100 && withPercentage.length > 0) {
    const largestIndex = withPercentage.reduce(
      (maxIndex, segment, index, list) => (
        segment.value > list[maxIndex].value ? index : maxIndex
      ),
      0
    );
    withPercentage[largestIndex].percentage += 100 - percentageSum;
  }

  return withPercentage;
}

/**
 * Arma los datos del gráfico "Estado General de Tareas".
 *
 * @param {object} params
 * @param {number} params.completedTasks - Tareas completadas.
 * @param {number} params.totalTasks - Tareas activas (normalmente pendientes + expiradas).
 * @param {number} [params.expiredTasks] - Tareas vencidas no completadas.
 * @param {number} [params.pendingTasks] - Tareas pendientes vigentes.
 */
export function calcularEstadoGeneralTareas({
  completedTasks = 0,
  totalTasks = 0,
  expiredTasks = 0,
  pendingTasks = 0,
} = {}) {
  const completed = Math.max(0, completedTasks);
  const expired = Math.max(0, expiredTasks);
  const pending = pendingTasks > 0
    ? pendingTasks
    : Math.max(0, totalTasks - expired);

  return calcularDistribucionPorcentual([
    { name: 'Completadas', value: completed, color: '#22c55e' },
    { name: 'Pendientes', value: pending, color: '#f59e0b' },
    { name: 'Expiradas', value: expired, color: '#ef4444' },
  ]);
}
