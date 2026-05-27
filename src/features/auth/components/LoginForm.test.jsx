/**
 * Pruebas Unitarias – LoginForm (Módulo 2)
 * Técnicas: Caja Negra (clases de equivalencia + valores límite)
 *           Caja Blanca (camino básico, V(G) = 6)
 *
 * Casos: CLN01 – CLN06
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoist mocks so they're available inside vi.mock factories ───────────────
const { mockNavigate, mockLogin, mockRegister, mockGetUser } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockLogin:    vi.fn(),
  mockRegister: vi.fn(),
  mockGetUser:  vi.fn(),
}));

// ─── Module mocks ────────────────────────────────────────────────────────────

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ login: mockLogin, register: mockRegister }),
}));

vi.mock('../../../shared/api/supabase', () => ({
  supabase: {
    auth: { getUser: mockGetUser },
  },
}));

// ─── Import component after mocks ────────────────────────────────────────────
import LoginForm from './LoginForm';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderForm() {
  return render(<LoginForm />);
}

function fillAndSubmitLogin(email = 'usuario@test.com', password = 'password123') {
  fireEvent.change(screen.getByPlaceholderText('tu@email.com'), {
    target: { value: email },
  });
  fireEvent.change(screen.getByPlaceholderText('Tu contraseña'), {
    target: { value: password },
  });
  fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }));
}

async function switchToRegisterMode() {
  fireEvent.click(screen.getByRole('button', { name: /¿no tienes cuenta\? regístrate/i }));
  await screen.findByRole('button', { name: /crear cuenta/i });
}

function fillAndSubmitRegister({
  name     = 'David Barceló',
  email    = 'nuevo@test.com',
  password = 'password123',
} = {}) {
  fireEvent.change(screen.getByPlaceholderText('Tu nombre completo'), {
    target: { value: name },
  });
  fireEvent.change(screen.getByPlaceholderText('tu@email.com'), {
    target: { value: email },
  });
  fireEvent.change(screen.getByPlaceholderText('Tu contraseña'), {
    target: { value: password },
  });
  fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }));
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('LoginForm – Pruebas Unitarias (CLN01 – CLN06)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── CLN01: Login exitoso – estudiante ─────────────────────────────────────
  it('CLN01 – Login exitoso como estudiante redirige a /home', async () => {
    mockLogin.mockResolvedValue({ success: true });
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'usuario@test.com', user_metadata: { role: 'student' } } },
    });

    renderForm();
    fillAndSubmitLogin('usuario@test.com', 'password123');

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('usuario@test.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  // ── CLN02: Login exitoso – docente ────────────────────────────────────────
  it('CLN02 – Login exitoso como docente redirige a /teacher/home', async () => {
    mockLogin.mockResolvedValue({ success: true });
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'teacher@gmail.com', user_metadata: { role: 'teacher' } } },
    });

    renderForm();
    fillAndSubmitLogin('teacher@gmail.com', 'password123');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/teacher/home');
    });
  });

  // ── CLN03: Credenciales inválidas – muestra error ─────────────────────────
  it('CLN03 – Credenciales incorrectas muestran mensaje de error', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      error: 'Credenciales inválidas',
    });

    renderForm();
    fillAndSubmitLogin('usuario@test.com', 'wrongpass');

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // ── CLN04: Registro exitoso sin confirmación de email ─────────────────────
  it('CLN04 – Registro exitoso sin confirmación de email redirige a /home', async () => {
    mockRegister.mockResolvedValue({
      success: true,
      requiresEmailConfirmation: false,
    });

    renderForm();
    await switchToRegisterMode();
    fillAndSubmitRegister();

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'nuevo@test.com',
        'password123',
        'David Barceló',
        'student'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  // ── CLN05: Registro con confirmación de email requerida ───────────────────
  it('CLN05 – Registro con confirmación de email muestra mensaje de éxito', async () => {
    mockRegister.mockResolvedValue({
      success: true,
      requiresEmailConfirmation: true,
    });

    renderForm();
    await switchToRegisterMode();
    fillAndSubmitRegister();

    await waitFor(() => {
      expect(
        screen.getByText('Registro exitoso. Revisa tu email para confirmar tu cuenta.')
      ).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // ── CLN06: Excepción de red ───────────────────────────────────────────────
  it('CLN06 – Excepción de red muestra mensaje de error inesperado', async () => {
    mockLogin.mockRejectedValue(new Error('Network Error'));

    renderForm();
    fillAndSubmitLogin('usuario@test.com', 'password123');

    await waitFor(() => {
      expect(screen.getByText('Ocurrió un error inesperado')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
