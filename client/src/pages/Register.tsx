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
      toast.success('Registro exitoso. Por favor verifica tu email antes de iniciar sesión.');
      navigate('/login');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className={`${formStyles.formContainer} card`}>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Registro</h2>
          <p className="mt-2 text-sm text-gray-600">
            Crea tu cuenta en el Sistema de Gestión de Soporte Técnico
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
              placeholder="Juan Pérez"
            />
            {errors.full_name && (
              <p className="error-message">{errors.full_name.message}</p>
            )}
          </div>

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

          <div className={formStyles.formGroup}>
            <label htmlFor="password" className="label-field">
              Contraseña
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
            <label htmlFor="phone" className="label-field">
              Teléfono (Opcional)
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className={`input-field ${errors.phone ? formStyles.inputError : ''}`}
              placeholder="+1234567890"
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
            disabled={loading}
          >
            {loading ? (
              <span className={formStyles.loadingSpinner}></span>
            ) : (
              'Registrarse'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

