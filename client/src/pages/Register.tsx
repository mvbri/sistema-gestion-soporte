import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { registroSchema } from '../schemas/authSchemas';
import type { RegisterData } from '../services/authService';
import { useDireccionesOptions } from '../hooks/useDireccionesOptions';
import formStyles from '../styles/modules/forms.module.css';

const formatRegisterData = (data: RegisterData): RegisterData => {
  const formatRequiredField = (value: string): string => value.trim();
  
  const formatOptionalField = (value?: string | null): string | null => {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  };

  return {
    full_name: formatRequiredField(data.full_name),
    email: formatRequiredField(data.email),
    password: data.password,
    phone: formatOptionalField(data.phone),
    incident_area_id: data.incident_area_id,
  };
};

export const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { data: direcciones = [], isLoading: loadingDirecciones } = useDireccionesOptions();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registroSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    setLoading(true);
    try {
      const cleanData = formatRegisterData(data);
      await registerUser(cleanData);
      toast.success('Registro exitoso. Ahora configura tus preguntas de seguridad.');
      navigate('/configurar-preguntas-seguridad', {
        state: { email: cleanData.email }
      });
    } catch (err: unknown) {
      let errorMessage = 'Error al registrar usuario';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string; errors?: Array<{ msg?: string; message?: string }> } } };
        const data = axiosError.response?.data;
        
        if (data?.errors?.length) {
          errorMessage = data.errors.map((e) => e.msg || e.message).filter(Boolean).join(', ');
        } else if (data?.message) {
          errorMessage = data.message;
        }
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
        className={`${formStyles.formContainer} relative z-10 w-full max-w-sm sm:max-w-md px-5 py-7 sm:px-10 sm:py-11 rounded-3xl bg-gradient-to-b from-slate-950/90 via-sky-950/80 to-slate-950/90 backdrop-blur-xl shadow-2xl shadow-sky-950/70 border border-sky-400/35`}
      >
        <div className="text-center mb-6 sm:mb-7">
          <div className="flex justify-center mb-4">
            <img
              src="/alcado.webp"
              alt="Logo Alcaldía"
              className="h-16 w-auto object-contain"
            />
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            Registro
          </h2>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-blue-100/90">
            Crea tu cuenta en el Sistema de Gestión de Soporte Técnico
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className={formStyles.formGroup}>
            <label htmlFor="full_name" className="label-field text-blue-50 text-sm font-medium mb-1 block">
              Nombre Completo
            </label>
            <input
              id="full_name"
              type="text"
              {...register('full_name')}
              autoComplete="off"
              className={`input-dark ${errors.full_name ? formStyles.inputError : ''}`}
              placeholder="Juan Pérez"
            />
            {errors.full_name && (
              <p className="error-message mt-1 text-xs text-red-200">{errors.full_name.message}</p>
            )}
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="email" className="label-field text-blue-50 text-sm font-medium mb-1 block">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              autoComplete="off"
              className={`input-dark ${errors.email ? formStyles.inputError : ''}`}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="error-message mt-1 text-xs text-red-200">{errors.email.message}</p>
            )}
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="password" className="label-field text-blue-50 text-sm font-medium mb-1 block">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                autoComplete="new-password"
                className={`input-dark w-full pr-10 ${errors.password ? formStyles.inputError : ''}`}
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
                    className="h-5 w-5 transition-all duration-150 ease-out rotate-0 opacity-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  // Icono ojo abierto
                  <svg
                    className="h-5 w-5 transition-all duration-150 ease-out rotate-0 opacity-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
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
            <label htmlFor="phone" className="label-field text-blue-50 text-sm font-medium mb-1 block">
              Teléfono (Opcional)
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              autoComplete="off"
              className={`input-dark ${errors.phone ? formStyles.inputError : ''}`}
              placeholder="+1234567890"
            />
            {errors.phone && (
              <p className="error-message mt-1 text-xs text-red-200">{errors.phone.message}</p>
            )}
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="incident_area_id" className="label-field text-blue-50 text-sm font-medium mb-1 block">
              Dirección
            </label>
            <select
              id="incident_area_id"
              {...register('incident_area_id', { valueAsNumber: true })}
              className={`input-dark ${formStyles.selectField} ${errors.incident_area_id ? formStyles.inputError : ''}`}
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
              <p className="error-message mt-1 text-xs text-red-200">{errors.incident_area_id.message}</p>
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
              'Registrarse'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white">
          ¿Ya tienes una cuenta?{' '}
          <Link
            to="/login"
            className="text-sky-100 hover:text-white font-semibold inline-block
                       hover:underline underline-offset-4 decoration-sky-200/80 hover:decoration-white
                       px-2 rounded-md
                       transform transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-105"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

