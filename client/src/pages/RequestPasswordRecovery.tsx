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
    <div 
      className="min-h-screen flex items-center justify-center bg-slate-100 py-10 px-4 sm:px-6 lg:px-8"
    >
      <div
        className={`${formStyles.formContainer} relative z-10 px-8 py-9 sm:px-10 sm:py-11 rounded-3xl bg-gradient-to-b from-slate-950/90 via-sky-950/80 to-slate-950/90 backdrop-blur-xl shadow-2xl shadow-sky-950/70 border border-sky-400/35`}
      >
        <div className="text-center mb-7">
          <h2 className="text-3xl font-bold text-white">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-sm text-blue-100/90">
            Elige un método de recuperación
          </p>
        </div>

        <div className="mb-6 space-y-3">
          <button
            type="button"
            onClick={() => handleMethodChange('email')}
            className={`w-full p-3 rounded-xl border transition-colors ${
              method === 'email'
                ? 'border-sky-500 bg-slate-900 text-slate-50'
                : 'border-slate-800 bg-slate-900/40 text-slate-200 hover:border-sky-500/50 hover:bg-slate-900/55'
            }`}
          >
            <div className="font-medium text-sm sm:text-base">📧 Recuperar por Email</div>
            <div className="text-xs mt-1 text-slate-400">
              Te enviaremos un enlace a tu correo electrónico
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleMethodChange('security-questions')}
            className={`w-full p-3 rounded-xl border transition-colors ${
              method === 'security-questions'
                ? 'border-sky-500 bg-slate-900 text-slate-50'
                : 'border-slate-800 bg-slate-900/40 text-slate-200 hover:border-sky-500/50 hover:bg-slate-900/55'
            }`}
          >
            <div className="font-medium text-sm sm:text-base">🔒 Recuperar con Preguntas de Seguridad</div>
            <div className="text-xs mt-1 text-slate-400">
              Responde tus preguntas de seguridad configuradas
            </div>
          </button>
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

          <button
            type="submit"
            className="btn-primary w-full mt-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-900/40 py-2.5
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 focus:ring-offset-slate-900
                       disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
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

        <p className="mt-6 text-center text-sm text-white">
          <Link
            to="/login"
            className="text-sky-100 hover:text-white font-semibold inline-block
                       hover:underline underline-offset-4 decoration-sky-200/80 hover:decoration-white
                       px-2 rounded-md transition-colors duration-150"
          >
            Volver al login
          </Link>
        </p>
      </div>
    </div>
  );
};

