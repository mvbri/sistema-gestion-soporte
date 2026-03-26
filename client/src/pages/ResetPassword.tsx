import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { restablecerPasswordSchema } from '../schemas/authSchemas';
import formStyles from '../styles/modules/forms.module.css';

interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(restablecerPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      toast.error('Token de recuperación no encontrado');
      navigate('/recuperar-password');
    }
  }, [token, navigate]);

  const onSubmit = async (data: ResetPasswordData) => {
    if (!token) {
      toast.error('Token de recuperación no encontrado');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword(token, data.password);
      if (response.success) {
        toast.success('Contraseña restablecida exitosamente');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(response.message || 'Error al restablecer contraseña');
      }
    } catch (err: unknown) {
      let errorMessage = 'Error al restablecer contraseña';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-slate-100 py-10 px-4 sm:px-6 lg:px-8"
    >
      <div
        className={`${formStyles.formContainer} relative z-10 px-8 py-9 sm:px-10 sm:py-11 rounded-3xl bg-gradient-to-b from-slate-950/90 via-sky-950/80 to-slate-950/90 backdrop-blur-xl shadow-2xl shadow-sky-950/70 border border-sky-400/35`}
      >
        <div className="text-center mb-7">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            Restablecer Contraseña
          </h2>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className={formStyles.formGroup}>
            <label htmlFor="password" className="label-field text-blue-50 text-sm font-medium mb-1 block">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`input-dark ${errors.password ? formStyles.inputError : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-transform duration-150 ease-out active:scale-95"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  // Icono ojo tachado
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 transition-all duration-150 ease-out rotate-0 opacity-100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18M10.584 10.587A2 2 0 0113.413 13.416M9.88 4.587A9.38 9.38 0 0112 4.25c4.136 0 7.706 2.5 9.25 6-.463 1.111-1.11 2.118-1.9 3M6.228 6.228C4.35 7.28 2.9 8.96 2.25 10.25c.71 1.52 1.78 2.84 3.11 3.86A9.34 9.34 0 0012 19.75c1.37 0 2.68-.26 3.89-.75"
                    />
                  </svg>
                ) : (
                  // Icono ojo abierto
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 transition-all duration-150 ease-out rotate-0 opacity-100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12C3.8 7.75 7.52 4.75 12 4.75s8.2 3 9.75 7.25c-1.55 4.25-5.27 7.25-9.75 7.25S3.8 16.25 2.25 12z"
                    />
                    <circle cx="12" cy="12" r="3.25" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="error-message mt-1 text-xs text-red-200">{errors.password.message}</p>
            )}
            <p className="mt-1 text-xs text-blue-100/90">
              Mínimo 8 caracteres, una mayúscula, una minúscula y un número
            </p>
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="confirmPassword" className="label-field text-blue-50 text-sm font-medium mb-1 block">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className={`input-dark ${errors.confirmPassword ? formStyles.inputError : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-transform duration-150 ease-out active:scale-95"
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirmPassword ? (
                  // Icono ojo tachado
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 transition-all duration-150 ease-out rotate-0 opacity-100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18M10.584 10.587A2 2 0 0113.413 13.416M9.88 4.587A9.38 9.38 0 0112 4.25c4.136 0 7.706 2.5 9.25 6-.463 1.111-1.11 2.118-1.9 3M6.228 6.228C4.35 7.28 2.9 8.96 2.25 10.25c.71 1.52 1.78 2.84 3.11 3.86A9.34 9.34 0 0012 19.75c1.37 0 2.68-.26 3.89-.75"
                    />
                  </svg>
                ) : (
                  // Icono ojo abierto
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 transition-all duration-150 ease-out rotate-0 opacity-100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12C3.8 7.75 7.52 4.75 12 4.75s8.2 3 9.75 7.25c-1.55 4.25-5.27 7.25-9.75 7.25S3.8 16.25 2.25 12z"
                    />
                    <circle cx="12" cy="12" r="3.25" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="error-message mt-1 text-xs text-red-200">{errors.confirmPassword.message}</p>
            )}
          </div>

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
              'Restablecer Contraseña'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

