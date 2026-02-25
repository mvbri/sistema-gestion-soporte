import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { recuperacionSchema } from '../schemas/authSchemas';
import formStyles from '../styles/modules/forms.module.css';

interface RecoveryData {
  email: string;
}

type RecoveryMethod = 'email' | 'security-questions';

export const RequestPasswordRecovery: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<RecoveryMethod>('email');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoveryData>({
    resolver: zodResolver(recuperacionSchema),
  });

  const handleMethodChange = (newMethod: RecoveryMethod) => {
    setMethod(newMethod);
  };

  const onSubmit = async (data: RecoveryData) => {
    setLoading(true);
    try {
      if (method === 'email') {
        const response = await authService.requestPasswordRecovery(data.email);
        if (response.success) {
          toast.success('Se ha enviado un email con las instrucciones para recuperar tu contraseña.');
        } else {
          toast.error(response.message || 'Error al solicitar recuperación');
        }
      } else {
        const response = await authService.getSecurityQuestions(data.email);
        if (response.success && response.data) {
          navigate('/verificar-preguntas-seguridad', {
            state: {
              email: data.email,
              questions: response.data
            }
          });
        } else {
          const errorMessage = response.message || 'No se encontraron preguntas de seguridad para este usuario';
          toast.error(errorMessage);
        }
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
            Elige un método de recuperación
          </p>
        </div>

        <div className="mb-6 space-y-3">
          <button
            type="button"
            onClick={() => handleMethodChange('email')}
            className={`w-full p-3 rounded-lg border-2 transition-colors ${
              method === 'email'
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="font-medium">📧 Recuperar por Email</div>
            <div className="text-xs mt-1 text-gray-500">
              Te enviaremos un enlace a tu correo electrónico
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleMethodChange('security-questions')}
            className={`w-full p-3 rounded-lg border-2 transition-colors ${
              method === 'security-questions'
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="font-medium">🔒 Recuperar con Preguntas de Seguridad</div>
            <div className="text-xs mt-1 text-gray-500">
              Responde tus preguntas de seguridad configuradas
            </div>
          </button>
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
            ) : method === 'email' ? (
              'Enviar enlace de recuperación'
            ) : (
              'Continuar con preguntas de seguridad'
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

