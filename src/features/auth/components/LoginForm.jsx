import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, GraduationCap, User } from 'lucide-react';
import { supabase } from '../../../shared/api/supabase';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [userRole, setUserRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      let result;
      if (isRegistering) {
        result = await register(email, password, name, userRole);
        if (result.success) {
          if (result.requiresEmailConfirmation) {
            setSuccessMessage('Registro exitoso. Revisa tu email para confirmar tu cuenta.');
          } else {
            navigate('/home');
          }
        } else {
          setError(result.error);
        }
      } else {
        result = await login(email, password);
        if (result.success) {
          // Check if user is a teacher
          const { data: { user } } = await supabase.auth.getUser();
          const isTeacher = user?.email === 'teacher@gmail.com' || user?.user_metadata?.role === 'teacher';

          if (isTeacher) {
            navigate('/teacher/home');
          } else {
            navigate('/home');
          }
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRegistering ? 'Únete a Captus' : 'Accede a tu cuenta de Captus'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-xl shadow-sm p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isRegistering && (
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Nombre completo
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full"
                  placeholder="Tu nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            {isRegistering && (
              <div>
                <Label className="block text-sm font-medium text-foreground mb-3">
                  Tipo de usuario
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserRole('student')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${userRole === 'student'
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <GraduationCap className={`h-6 w-6 ${userRole === 'student' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-medium ${userRole === 'student' ? 'text-primary' : 'text-foreground'}`}>
                      Estudiante
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRole('teacher')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${userRole === 'teacher'
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <User className={`h-6 w-6 ${userRole === 'teacher' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-medium ${userRole === 'teacher' ? 'text-primary' : 'text-foreground'}`}>
                      Profesor
                    </span>
                  </button>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Correo electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="w-full"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pr-10"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <p className="text-primary text-sm">{successMessage}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? 'Cargando...' : (isRegistering ? 'Crear cuenta' : 'Iniciar sesión')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              {isRegistering
                ? '¿Ya tienes cuenta? Inicia sesión'
                : '¿No tienes cuenta? Regístrate'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;