import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { verifySecurityAnswersSchema } from '../schemas/authSchemas';
import formStyles from '../styles/modules/forms.module.css';

interface VerifyAnswersData {
  email: string;
  answer1: string;
  answer2: string;
}

export const VerifySecurityQuestions: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<{ question1: string; question2: string } | null>(null);
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const state = location.state as { email?: string; questions?: { question1: string; question2: string } } | null;
    
    if (state?.email && state?.questions) {
      setEmail(state.email);
      setQuestions(state.questions);
    } else {
      toast.error('No se encontraron preguntas de seguridad');
      navigate('/recuperar-password');
    }
  }, [location, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VerifyAnswersData>({
    resolver: zodResolver(verifySecurityAnswersSchema),
    defaultValues: {
      email: email,
    },
  });

  useEffect(() => {
    if (email) {
      setValue('email', email);
    }
  }, [email, setValue]);

  const onSubmit = async (data: VerifyAnswersData) => {
    setLoading(true);
    try {
      const response = await authService.verifySecurityAnswers(
        email || data.email,
        data.answer1,
        data.answer2
      );
      
      if (response.success && response.data?.token) {
        toast.success('Respuestas verificadas correctamente');
        navigate(`/restablecer-password?token=${response.data.token}`);
      } else {
        toast.error(response.message || 'Las respuestas son incorrectas');
      }
    } catch (err: unknown) {
      let errorMessage = 'Error al verificar respuestas';
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

  if (!questions) {
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
            Preguntas de Seguridad
          </h2>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90">
            Responde las siguientes preguntas para recuperar tu contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('email')} value={email} />

          <div className={formStyles.formGroup}>
            <label htmlFor="question1" className="label-field text-blue-50 text-sm font-medium mb-1 block">
              Pregunta 1
            </label>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-600 text-slate-100 text-sm">
              {questions.question1}
            </div>
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
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="question2" className="label-field text-blue-50 text-sm font-medium mb-1 block">
              Pregunta 2
            </label>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-600 text-slate-100 text-sm">
              {questions.question2}
            </div>
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
              'Verificar Respuestas'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white">
          <Link
            to="/recuperar-password"
            className="text-sky-100 hover:text-white font-semibold inline-block
                       hover:underline underline-offset-4 decoration-sky-200/80 hover:decoration-white
                       px-2 rounded-md transition-colors duration-150"
          >
            Volver a recuperación
          </Link>
        </p>
      </div>
    </div>
  );
};
