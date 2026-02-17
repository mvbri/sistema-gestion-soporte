import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { perfilSchema } from '../schemas/authSchemas';
import type { UpdateProfileData } from '../services/authService';
import formStyles from '../styles/modules/forms.module.css';

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
    department: formatRequiredField(data.department),
  };
};

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();

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
      department: user?.department ?? '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        phone: user.phone ?? '',
        department: user.department ?? '',
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
              value={user.role.replace('_', ' ')}
              disabled
              className="input-field bg-gray-100 cursor-not-allowed capitalize"
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
            <label htmlFor="department" className="label-field">
              Departamento
            </label>
            <select
              id="department"
              {...register('department')}
              className={`input-field ${formStyles.selectField} ${errors.department ? formStyles.inputError : ''}`}
            >
              <option value="">Selecciona un departamento</option>
              <option value="IT">IT</option>
              <option value="Direccion">Direccion</option>
              <option value="Secretaria">Secretaria</option>
              <option value="otro">otro</option>
            </select>
            {errors.department && (
              <p className="error-message">{errors.department.message}</p>
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
      </div>
    </div>
  );
};

