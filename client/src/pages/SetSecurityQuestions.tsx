import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { securityQuestionsSchema } from '../schemas/authSchemas';
import formStyles from '../styles/modules/forms.module.css';

interface SecurityQuestionsData {
  question1: string;
  answer1: string;
  question2: string;
  answer2: string;
}

export const SetSecurityQuestions: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const state = location.state as { email?: string } | null;
    
    if (state?.email) {
      setEmail(state.email);
    } else {
      toast.error('No se encontró información del registro');
      navigate('/registro');
    }
  }, [location, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SecurityQuestionsData>({
    resolver: zodResolver(securityQuestionsSchema),
  });

  const onSubmit = async (data: SecurityQuestionsData) => {
    setLoading(true);
    try {
      if (!email) {
        toast.error('No se encontró el email del registro');
        navigate('/registro');
        return;
      }

      const response = await authService.setSecurityQuestionsPublic(
        email,
        data.question1.trim(),
        data.answer1.trim(),
        data.question2.trim(),
        data.answer2.trim()
      );
      
      if (response.success) {
        toast.success('Preguntas de seguridad configuradas exitosamente');
        navigate('/login', {
          state: { message: 'Registro completado. Por favor verifica tu email antes de iniciar sesión.' }
        });
      } else {
        toast.error(response.message || 'Error al configurar preguntas de seguridad');
      }
    } catch (err: unknown) {
      let errorMessage = 'Error al configurar preguntas de seguridad';
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
      className="min-h-screen flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: 'url(/alcaldiaheres.jpg.jpeg)',
      }}
    >
      <div className="absolute inset-0 bg-blue-900/40"></div>
      <div
        className={`${formStyles.formContainer} relative z-10 w-full max-w-lg px-8 py-9 sm:px-10 sm:py-11 rounded-3xl bg-gradient-to-b from-slate-950/90 via-sky-950/80 to-slate-950/90 backdrop-blur-xl shadow-2xl shadow-sky-950/70 border border-sky-400/35`}
      >
        <div className="text-center mb-7">
          <div className="flex justify-center mb-4">
            <img
              src="/alcado.webp"
              alt="Logo Alcaldía"
              className="h-16 w-auto object-contain"
            />
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            Preguntas de Seguridad
          </h2>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-blue-100/90">
            Configura tus preguntas de seguridad para recuperar tu contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className={formStyles.formGroup}>
            <label htmlFor="question1" className="label-field text-blue-50 text-sm font-medium mb-1 block">
              Pregunta 1
            </label>
            <textarea
              id="question1"
              {...register('question1')}
              rows={3}
              className={`input-dark resize-none ${errors.question1 ? formStyles.inputError : ''}`}
              placeholder="Ej: ¿Cuál es el nombre de tu mascota favorita?"
              autoComplete="off"
            />
            {errors.question1 && (
              <p className="error-message mt-1 text-xs text-red-200">{errors.question1.message}</p>
            )}
            <p className="mt-1 text-xs text-blue-100/90">
              Mínimo 10 caracteres
            </p>
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="answer1" className="label-field text-blue-50 text-sm font-medium mb-1 block">
              Respuesta 1
            </label>
            <input
              id="answer1"
              type="text"
              {...register('answer1')}
              className={`input-dark ${errors.answer1 ? formStyles.inputError : ''}`}
              placeholder="Tu respuesta"
              autoComplete="off"
            />
            {errors.answer1 && (
              <p className="error-message mt-1 text-xs text-red-200">{errors.answer1.message}</p>
            )}
            <p className="mt-1 text-xs text-blue-100/90">
              Mínimo 3 caracteres
            </p>
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="question2" className="label-field text-blue-50 text-sm font-medium mb-1 block">
              Pregunta 2
            </label>
            <textarea
              id="question2"
              {...register('question2')}
              rows={3}
              className={`input-dark resize-none ${errors.question2 ? formStyles.inputError : ''}`}
              placeholder="Ej: ¿En qué ciudad naciste?"
              autoComplete="off"
            />
            {errors.question2 && (
              <p className="error-message mt-1 text-xs text-red-200">{errors.question2.message}</p>
            )}
            <p className="mt-1 text-xs text-blue-100/90">
              Mínimo 10 caracteres
            </p>
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="answer2" className="label-field text-blue-50 text-sm font-medium mb-1 block">
              Respuesta 2
            </label>
            <input
              id="answer2"
              type="text"
              {...register('answer2')}
              className={`input-dark ${errors.answer2 ? formStyles.inputError : ''}`}
              placeholder="Tu respuesta"
              autoComplete="off"
            />
            {errors.answer2 && (
              <p className="error-message mt-1 text-xs text-red-200">{errors.answer2.message}</p>
            )}
            <p className="mt-1 text-xs text-blue-100/90">
              Mínimo 3 caracteres
            </p>
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
              'Configurar Preguntas'
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
            Omitir por ahora
          </Link>
        </p>
      </div>
    </div>
  );
};
