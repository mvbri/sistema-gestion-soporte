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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className={`${formStyles.formContainer} card`}>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Restablecer Contraseña</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className={formStyles.formGroup}>
            <label htmlFor="password" className="label-field">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`input-field ${errors.password ? formStyles.inputError : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Mínimo 8 caracteres, una mayúscula, una minúscula y un número
            </p>
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="confirmPassword" className="label-field">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className={`input-field ${errors.confirmPassword ? formStyles.inputError : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="error-message">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
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

