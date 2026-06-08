// @vitest-environment node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PRUEBA UNITARIA  PU01 – Validador de Contraseña
 * Proyecto: Captus – Plataforma Web para la Gestión Académica Inteligente
 * Módulo:   src/lib/passwordValidator.js
 *
 * Técnicas aplicadas:
 *   • Caja Negra  – Clases de Equivalencia (CV / CI)
 *   • Caja Negra  – Valores Límite (VL)
 *   • Caja Blanca – Camino básico (cubre todos los if del validador)
 *
 * Clases de Equivalencia definidas:
 *   CE1 (CV) – Contraseña con 8–32 chars, ≥1 mayúscula, ≥1 dígito   → válida
 *   CE2 (CI) – Contraseña vacía o nula                               → error
 *   CE3 (CI) – Contraseña < 8 chars                                  → error
 *   CE4 (CI) – Contraseña > 32 chars                                 → error
 *   CE5 (CI) – Sin mayúscula                                         → error
 *   CE6 (CI) – Sin minúscula                                         → error
 *   CE7 (CI) – Sin dígito                                            → error
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { describe, it, expect } from 'vitest';
import { validatePassword } from '../passwordValidator';

describe('PU01 – Validador de Contraseña (passwordValidator)', () => {
  // ─── Clases Válidas ────────────────────────────────────────────────────────

  it('PU01-CV01 | CE1 | Contraseña válida completa → valid: true', () => {
    const resultado = validatePassword('Secure01');
    expect(resultado.valid).toBe(true);
    expect(resultado.error).toBeNull();
  });

  it('PU01-CV02 | CE1 | Contraseña de 32 caracteres válida → acepta el límite superior', () => {
    // 32 chars, 1 mayúscula, 1 dígito
    const pass = 'Aa1' + 'b'.repeat(29); // 32 chars
    const resultado = validatePassword(pass);
    expect(resultado.valid).toBe(true);
    expect(resultado.error).toBeNull();
  });

  // ─── Clases Inválidas ──────────────────────────────────────────────────────

  it('PU01-CI01 | CE2 | Contraseña vacía → error obligatoria', () => {
    const resultado = validatePassword('');
    expect(resultado.valid).toBe(false);
    expect(resultado.error).toMatch(/obligatoria/i);
  });

  it('PU01-CI02 | CE2 | Contraseña nula → error obligatoria', () => {
    const resultado = validatePassword(null);
    expect(resultado.valid).toBe(false);
    expect(resultado.error).toMatch(/obligatoria/i);
  });

  it('PU01-CI03 | CE3 | Contraseña "123" (3 chars) → error mínimo 8 caracteres', () => {
    // Caso exacto del documento académico: PU01
    const resultado = validatePassword('123');
    expect(resultado.valid).toBe(false);
    expect(resultado.error).toMatch(/8 caracteres/i);
  });

  it('PU01-CI04 | CE3 | Contraseña de 7 caracteres → falla (1 bajo el mínimo)', () => {
    const resultado = validatePassword('Abc123x'); // 7 chars
    expect(resultado.valid).toBe(false);
    expect(resultado.error).toMatch(/8 caracteres/i);
  });

  it('PU01-CI05 | CE4 | Contraseña de 33 caracteres → falla (1 sobre el máximo)', () => {
    const pass = 'Aa1' + 'b'.repeat(30); // 33 chars
    const resultado = validatePassword(pass);
    expect(resultado.valid).toBe(false);
    expect(resultado.error).toMatch(/32 caracteres/i);
  });

  it('PU01-CI06 | CE5 | Sin mayúscula → error mayúscula requerida', () => {
    const resultado = validatePassword('contraseña1');
    expect(resultado.valid).toBe(false);
    expect(resultado.error).toMatch(/mayúscula/i);
  });

  it('PU01-CI07 | CE6 | Sin minúscula → error minúscula requerida', () => {
    const resultado = validatePassword('PASSWORD1');
    expect(resultado.valid).toBe(false);
    expect(resultado.error).toMatch(/minúscula/i);
  });

  it('PU01-CI08 | CE7 | Sin dígito → error número requerido', () => {
    const resultado = validatePassword('ContraseñaSinNum'); // sin número
    expect(resultado.valid).toBe(false);
    expect(resultado.error).toMatch(/número/i);
  });

  // ─── Valores Límite ────────────────────────────────────────────────────────

  it('PU01-VL01 | VL | 8 caracteres exactos → acepta el límite inferior', () => {
    const resultado = validatePassword('Secure01'); // exactamente 8
    expect(resultado.valid).toBe(true);
    expect(resultado.error).toBeNull();
  });

  it('PU01-VL02 | VL | 7 caracteres → rechaza 1 bajo el límite inferior', () => {
    const resultado = validatePassword('Secur01'); // 7 chars
    expect(resultado.valid).toBe(false);
    expect(resultado.error).toMatch(/8 caracteres/i);
  });

  it('PU01-VL03 | VL | 32 caracteres → acepta el límite superior', () => {
    const pass = 'A1' + 'x'.repeat(30); // 32 chars
    expect(validatePassword(pass).valid).toBe(true);
  });

  it('PU01-VL04 | VL | 33 caracteres → rechaza 1 sobre el límite superior', () => {
    const pass = 'A1' + 'x'.repeat(31); // 33 chars
    expect(validatePassword(pass).valid).toBe(false);
  });

  // ─── Camino Básico (Caja Blanca) ──────────────────────────────────────────
  // Cubre los if del módulo: vacío → <8 → >32 → sin mayúscula → sin minúscula → sin número → ok

  it('PU01-CB01 | CB | Camino: vacío → sale en primer if', () => {
    expect(validatePassword('').valid).toBe(false);
  });

  it('PU01-CB02 | CB | Camino: <8 chars → sale en segundo if', () => {
    expect(validatePassword('Ab1xxxx').valid).toBe(false); // 7 chars
  });

  it('PU01-CB03 | CB | Camino: >32 chars → sale en tercer if', () => {
    expect(validatePassword('A1' + 'x'.repeat(31)).valid).toBe(false);
  });

  it('PU01-CB04 | CB | Camino: sin mayúscula → sale en cuarto if', () => {
    expect(validatePassword('abcde123').valid).toBe(false);
  });

  it('PU01-CB05 | CB | Camino: sin minúscula → sale en quinto if', () => {
    expect(validatePassword('ABCDE123').valid).toBe(false);
  });

  it('PU01-CB06 | CB | Camino: sin número → sale en sexto if', () => {
    expect(validatePassword('AbcdeXYZ').valid).toBe(false);
  });

  it('PU01-CB07 | CB | Camino completo sin errores → retorna valid: true', () => {
    expect(validatePassword('ValidPass1').valid).toBe(true);
  });
});
