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
  const [showPassword, setShowPassword] = useState(false);
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
          
          // Caso: Email no verificado
          if (axiosError.response.data.data?.requires_verification ||
              errorMessage.includes('verifica tu email') ||
              errorMessage.includes('email antes de iniciar')) {
            navigate('/solicitar-verificacion', {
              state: { email: data.email }
            });
            return;
          }
          
          // Caso: Usuario verificado pero inactivo
          if (errorMessage.includes('verificada pero inactiva') ||
              errorMessage.includes('inactiva. Contacta al administrador para activar')) {
            toast.error(errorMessage);
            return;
          }
          
          // Caso: Usuario inactivo (sin verificar)
          if (errorMessage.includes('desactivada') ||
              errorMessage.includes('desactivado')) {
            toast.error(errorMessage);
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
    <div 
      className="min-h-screen flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: 'url(/alcaldiaheres.jpg.jpeg)',
      }}
    >
      <div className="absolute inset-0 bg-blue-900/40"></div>
      <div
        className={`${formStyles.formContainer} relative z-10 w-full max-w-sm sm:max-w-md px-5 py-7 sm:px-10 sm:py-11 rounded-3xl bg-gradient-to-b from-slate-950/90 via-sky-950/80 to-slate-950/90 backdrop-blur-xl shadow-2xl shadow-sky-950/70 border border-sky-400/35`}
      >
        <div className="text-center mb-6 sm:mb-7">
          <div className="flex justify-center mb-4">
            <img
              src="/alcado.webp"
              alt="Logo Alcaldía"
              className="h-16 w-auto object-contain drop-shadow-lg"
            />
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            Iniciar Sesión
          </h2>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-blue-100/90">
            Sistema de Gestión de Soporte Técnico
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className={formStyles.formGroup}>
            <label htmlFor="email" className="label-field text-blue-50 text-sm font-medium mb-1 block">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={`input-dark ${errors.email ? formStyles.inputError : ''}`}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="error-message mt-1 text-xs text-red-200">{errors.email.message}</p>
            )}
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="password" className="label-field text-blue-50 text-sm font-medium mb-1 block">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`input-dark w-full pr-10 ${errors.password ? formStyles.inputError : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-transform duration-150 ease-out active:scale-95"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5 transition-all duration-150 ease-out rotate-0 opacity-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 transition-all duration-150 ease-out rotate-0 opacity-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="error-message mt-1 text-xs text-red-200">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded-md border-2 border-blue-200 bg-blue-900/40 text-blue-400 
                           focus:ring-2 focus:ring-offset-1 focus:ring-blue-300 
                           checked:bg-blue-400 checked:border-blue-100 transition-colors duration-150"
              />
              <span className="text-sm text-blue-50">Mantenerme conectado</span>
            </label>
          </div>
          <Link
            to="/recuperar-password"
            className="text-sm text-center text-sky-100 hover:text-white font-semibold inline-block mb-5
                       underline underline-offset-4 decoration-sky-200/80 hover:decoration-white
                       px-2 rounded-md
                       transform transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-105"
          >
            ¿Olvidaste tu contraseña?
          </Link>

          <button
            type="submit"
            className="btn-primary w-full mt-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-900/40 py-2.5
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 focus:ring-offset-slate-900
                       disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
            disabled={loading}
          >
            {loading ? (
              <span className={formStyles.loadingSpinner}></span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white">
          ¿No tienes una cuenta?{' '}
          <Link
            to="/registro"
            className="text-sky-100 hover:text-white font-semibold inline-block
                       hover:underline underline-offset-4 decoration-sky-200/80 hover:decoration-white
                       px-2 rounded-md
                       transform transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-105"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};


