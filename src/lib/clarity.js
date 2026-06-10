import Clarity from '@microsoft/clarity';

export function initClarity() {
  const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;

  if (!projectId || typeof window === 'undefined') return;

  Clarity.init(projectId);
}

export function identifyClarityUser(userId, friendlyName) {
  if (!import.meta.env.VITE_CLARITY_PROJECT_ID || !userId) return;

  Clarity.identify(userId, undefined, undefined, friendlyName);
}
