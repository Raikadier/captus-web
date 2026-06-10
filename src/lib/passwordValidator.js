/**
 * passwordValidator.js
 * Captus – Módulo de validación de contraseñas
 *
 * Reglas de negocio:
 *   RN-PW1: Longitud mínima de 8 caracteres.
 *   RN-PW2: Longitud máxima de 32 caracteres.
 *   RN-PW3: Al menos una letra mayúscula.
 *   RN-PW4: Al menos una letra minúscula.
 *   RN-PW5: Al menos un dígito numérico.
 *
 * Usado por: AuthContext (registro) y LoginForm (validación local).
 */

/**
 * Valida una contraseña según las reglas de negocio de Captus.
 *
 * @param {string} password - Contraseña a validar.
 * @returns {{ valid: boolean, error: string | null }} Resultado de la validación.
 */
export function validatePassword(password) {
  if (!password || password.length === 0) {
    return { valid: false, error: 'La contraseña es obligatoria' };
  }

  if (password.length < 8) {
    return {
      valid: false,
      error: 'La contraseña debe tener al menos 8 caracteres',
    };
  }

  if (password.length > 32) {
    return {
      valid: false,
      error: 'La contraseña no puede exceder 32 caracteres',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: 'La contraseña debe contener al menos una letra mayúscula',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error: 'La contraseña debe contener al menos una letra minúscula',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      error: 'La contraseña debe contener al menos un número',
    };
  }

  return { valid: true, error: null };
}
