import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { perfilSchema, securityQuestionsSchema } from '../schemas/authSchemas';
import type { UpdateProfileData } from '../services/authService';
import { authService } from '../services/authService';
import formStyles from '../styles/modules/forms.module.css';
import { translateRole } from '../utils/roleTranslations';
import { useDireccionesOptions } from '../hooks/useDireccionesOptions';

const formatProfileData = (data: UpdateProfileData): UpdateProfileData => {
  const formatRequiredField = (value: string): string => value.trim();

  const formatOptionalField = (value?: string | null): string | null => {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  };

  return {
    full_name: formatRequiredField(data.full_name),
    phone: formatOptionalField(data.phone),
    incident_area_id: data.incident_area_id,
  };
};

interface SecurityQuestionsData {
  question1: string;
  answer1: string;
  question2: string;
  answer2: string;
}

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [showSecurityQuestions, setShowSecurityQuestions] = useState(false);
  const { data: direcciones = [], isLoading: loadingDirecciones } = useDireccionesOptions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      full_name: user?.full_name ?? '',
      phone: user?.phone ?? '',
      incident_area_id: user?.incident_area_id ?? 0,
    },
  });

  const {
    register: registerSecurity,
    handleSubmit: handleSubmitSecurity,
    reset: resetSecurity,
    formState: { errors: errorsSecurity, isSubmitting: isSubmittingSecurity },
  } = useForm<SecurityQuestionsData>({
    resolver: zodResolver(securityQuestionsSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        phone: user.phone ?? '',
        incident_area_id: user.incident_area_id ?? 0,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateProfileData) => {
    try {
      const cleanData = formatProfileData(data);
      await updateProfile(cleanData);
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      let errorMessage = 'Error al actualizar perfil';

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    }
  };

  const onSubmitSecurityQuestions = async (data: SecurityQuestionsData) => {
    try {
      const response = await authService.setSecurityQuestions(
        data.question1.trim(),
        data.answer1.trim(),
        data.question2.trim(),
        data.answer2.trim()
      );
      
      if (response.success) {
        toast.success('Preguntas de seguridad configuradas correctamente');
        resetSecurity();
        setShowSecurityQuestions(false);
      } else {
        toast.error(response.message || 'Error al configurar preguntas de seguridad');
      }
    } catch (err) {
      let errorMessage = 'Error al configurar preguntas de seguridad';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <MainNavbar />
      <PageWrapper>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className={`${formStyles.formContainer} card max-w-lg w-full`}>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Mi Perfil</h2>
          <p className="mt-2 text-sm text-gray-600">
            Actualiza tu información personal. El email y el rol no se pueden modificar.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className={formStyles.formGroup}>
            <label htmlFor="full_name" className="label-field">
              Nombre Completo
            </label>
            <input
              id="full_name"
              type="text"
              {...register('full_name')}
              className={`input-field ${errors.full_name ? formStyles.inputError : ''}`}
            />
            {errors.full_name && (
              <p className="error-message">{errors.full_name.message}</p>
            )}
          </div>

          <div className={formStyles.formGroup}>
            <label className="label-field">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="input-field bg-gray-100 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              El email no se puede modificar. Contacta con un administrador si necesitas cambiarlo.
            </p>
          </div>

          <div className={formStyles.formGroup}>
            <label className="label-field">Rol</label>
            <input
              type="text"
              value={translateRole(user.role)}
              disabled
              className="input-field bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="phone" className="label-field">
              Teléfono (Opcional)
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className={`input-field ${errors.phone ? formStyles.inputError : ''}`}
            />
            {errors.phone && (
              <p className="error-message">{errors.phone.message}</p>
            )}
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="incident_area_id" className="label-field">
              Dirección
            </label>
            <select
              id="incident_area_id"
              {...register('incident_area_id', { valueAsNumber: true })}
              className={`input-field ${formStyles.selectField} ${errors.incident_area_id ? formStyles.inputError : ''}`}
              disabled={loadingDirecciones}
            >
              <option value="">
                {loadingDirecciones ? 'Cargando direcciones...' : 'Selecciona una dirección'}
              </option>
              {direcciones.map((direccion) => (
                <option key={direccion.id} value={direccion.id}>
                  {direccion.name}
                </option>
              ))}
            </select>
            {errors.incident_area_id && (
              <p className="error-message">{errors.incident_area_id.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Preguntas de Seguridad
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Configura preguntas de seguridad para recuperar tu contraseña si tienes problemas con tu email.
            </p>
            {!showSecurityQuestions && (
              <button
                type="button"
                onClick={() => setShowSecurityQuestions(true)}
                className="btn-secondary w-full"
              >
                Configurar Preguntas de Seguridad
              </button>
            )}
          </div>

          {showSecurityQuestions && (
            <form onSubmit={handleSubmitSecurity(onSubmitSecurityQuestions)} className="space-y-4">
              <div className={formStyles.formGroup}>
                <label htmlFor="question1" className="label-field">
                  Pregunta 1
                </label>
                <input
                  id="question1"
                  type="text"
                  {...registerSecurity('question1')}
                  className={`input-field ${errorsSecurity.question1 ? formStyles.inputError : ''}`}
                  placeholder="Ej: ¿Cuál es el nombre de tu mascota?"
                />
                {errorsSecurity.question1 && (
                  <p className="error-message">{errorsSecurity.question1.message}</p>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label htmlFor="answer1" className="label-field">
                  Respuesta 1
                </label>
                <input
                  id="answer1"
                  type="text"
                  {...registerSecurity('answer1')}
                  className={`input-field ${errorsSecurity.answer1 ? formStyles.inputError : ''}`}
                  placeholder="Tu respuesta"
                  autoComplete="off"
                />
                {errorsSecurity.answer1 && (
                  <p className="error-message">{errorsSecurity.answer1.message}</p>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label htmlFor="question2" className="label-field">
                  Pregunta 2
                </label>
                <input
                  id="question2"
                  type="text"
                  {...registerSecurity('question2')}
                  className={`input-field ${errorsSecurity.question2 ? formStyles.inputError : ''}`}
                  placeholder="Ej: ¿En qué ciudad naciste?"
                />
                {errorsSecurity.question2 && (
                  <p className="error-message">{errorsSecurity.question2.message}</p>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label htmlFor="answer2" className="label-field">
                  Respuesta 2
                </label>
                <input
                  id="answer2"
                  type="text"
                  {...registerSecurity('answer2')}
                  className={`input-field ${errorsSecurity.answer2 ? formStyles.inputError : ''}`}
                  placeholder="Tu respuesta"
                  autoComplete="off"
                />
                {errorsSecurity.answer2 && (
                  <p className="error-message">{errorsSecurity.answer2.message}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={isSubmittingSecurity}
                >
                  {isSubmittingSecurity ? 'Guardando...' : 'Guardar Preguntas'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSecurityQuestions(false);
                    resetSecurity();
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      </div>
      </PageWrapper>
    </>
  );
};

