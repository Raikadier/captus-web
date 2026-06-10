/** Normaliza respuestas API: array plano o envuelto en { success, data }. */
export function unwrapData(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.data !== undefined) return payload.data;
  return payload ?? [];
}

export function unwrapList(payload) {
  const data = unwrapData(payload);
  return Array.isArray(data) ? data : [];
}
