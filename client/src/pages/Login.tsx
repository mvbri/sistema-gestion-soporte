// Página de Login
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../schemas/authSchemas';
import type { LoginData } from '../services/authService';
import formStyles from '../styles/modules/forms.module.css';

export const Login: React.FC = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setLoading(true);
    try {
      await login(data, rememberMe);
      toast.success('Sesión iniciada exitosamente');
      navigate('/dashboard');
    } catch (err: unknown) {
      let errorMessage = 'Error al iniciar sesión';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string; data?: { requires_verification?: boolean } } } };
        if (axiosError.response?.data) {
          errorMessage = axiosError.response.data.message || errorMessage;
          if (axiosError.response.data.data?.requires_verification ||
              errorMessage.includes('verifica tu email') ||
              errorMessage.includes('email antes de iniciar')) {
            navigate('/solicitar-verificacion', {
              state: { email: data.email }
            });
            return;
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className={`${formStyles.formContainer} card`}>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gestión de Soporte Técnico
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className={formStyles.formGroup}>
            <label htmlFor="email" className="label-field">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={`input-field ${errors.email ? formStyles.inputError : ''}`}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="password" className="label-field">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className={`input-field ${errors.password ? formStyles.inputError : ''}`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Mantenerme conectado</span>
            </label>
            <Link
              to="/recuperar-password"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <span className={formStyles.loadingSpinner}></span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" className="text-primary-600 hover:text-primary-700 font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};


