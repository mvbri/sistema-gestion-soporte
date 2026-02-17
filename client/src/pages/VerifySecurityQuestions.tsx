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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className={`${formStyles.formContainer} card`}>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Preguntas de Seguridad</h2>
          <p className="mt-2 text-sm text-gray-600">
            Responde las siguientes preguntas para recuperar tu contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('email')} value={email} />

          <div className={formStyles.formGroup}>
            <label htmlFor="question1" className="label-field">
              Pregunta 1
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
              {questions.question1}
            </div>
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="answer1" className="label-field">
              Respuesta 1
            </label>
            <input
              id="answer1"
              type="text"
              {...register('answer1')}
              className={`input-field ${errors.answer1 ? formStyles.inputError : ''}`}
              placeholder="Tu respuesta"
              autoComplete="off"
            />
            {errors.answer1 && (
              <p className="error-message">{errors.answer1.message}</p>
            )}
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="question2" className="label-field">
              Pregunta 2
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
              {questions.question2}
            </div>
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="answer2" className="label-field">
              Respuesta 2
            </label>
            <input
              id="answer2"
              type="text"
              {...register('answer2')}
              className={`input-field ${errors.answer2 ? formStyles.inputError : ''}`}
              placeholder="Tu respuesta"
              autoComplete="off"
            />
            {errors.answer2 && (
              <p className="error-message">{errors.answer2.message}</p>
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
              'Verificar Respuestas'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link to="/recuperar-password" className="text-primary-600 hover:text-primary-700 font-medium">
            Volver a recuperación
          </Link>
        </p>
      </div>
    </div>
  );
};
