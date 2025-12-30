import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { recuperacionSchema } from '../schemas/authSchemas';
import formStyles from '../styles/modules/forms.module.css';

interface RecoveryData {
  email: string;
}

export const RequestPasswordRecovery: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoveryData>({
    resolver: zodResolver(recuperacionSchema),
  });

  const onSubmit = async (data: RecoveryData) => {
    setLoading(true);
    try {
      const response = await authService.requestPasswordRecovery(data.email);
      if (response.success) {
        toast.success('Se ha enviado un email con las instrucciones para recuperar tu contraseña.');
      } else {
        toast.error(response.message || 'Error al solicitar recuperación');
      }
    } catch (err: unknown) {
      let errorMessage = 'Error al solicitar recuperación';
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
          <h2 className="text-3xl font-bold text-gray-900">Recuperar Contraseña</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
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

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <span className={formStyles.loadingSpinner}></span>
            ) : (
              'Enviar enlace de recuperación'
            )}
          </button>
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

