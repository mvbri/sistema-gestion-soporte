import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { recuperacionSchema } from '../schemas/authSchemas';
import formStyles from '../styles/modules/forms.module.css';

interface VerificationData {
  email: string;
}

export const RequestVerification: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const emailFromState = location.state?.email || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VerificationData>({
    resolver: zodResolver(recuperacionSchema),
    defaultValues: {
      email: emailFromState,
    },
  });

  useEffect(() => {
    if (emailFromState) {
      setValue('email', emailFromState);
    }
  }, [emailFromState, setValue]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: VerificationData) => {
    if (cooldown > 0) {
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resendVerification(data.email);
      if (response.success) {
        toast.success('Se ha enviado un nuevo email de verificación.');
        setCooldown(60);
      } else {
        toast.error(response.message || 'Error al enviar verificación');
      }
    } catch (err: unknown) {
      let errorMessage = 'Error al enviar verificación';
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className={`${formStyles.formContainer} card`}>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Verificar Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            Necesitas verificar tu email antes de iniciar sesión
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

          {cooldown > 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-2">
                Espera antes de solicitar otro email
              </p>
              <p className="text-2xl font-bold text-primary-600">
                {formatTime(cooldown)}
              </p>
            </div>
          ) : (
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className={formStyles.loadingSpinner}></span>
              ) : (
                'Enviar email de verificación'
              )}
            </button>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Volver al login
          </Link>
        </p>
      </div>
    </div>
  );
};

