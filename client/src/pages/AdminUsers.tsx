import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useAdminUsers, useCreateUser, useUpdateUserStatus, useUpdateUser, useDeleteUser, useVerifyUserEmail } from '../hooks/useAdmin';
import { useDireccionesOptions } from '../hooks/useDireccionesOptions';
import { EditIcon } from '../components/icons/EditIcon';
import { DeleteIcon } from '../components/icons/DeleteIcon';
import { ToggleIcon } from '../components/icons/ToggleIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { ClearFiltersIcon } from '../components/icons/ClearFiltersIcon';
import type { User } from '../types';
import type { UsersFilters, UpdateUserData, UsersResponse } from '../services/adminService';
import formStyles from '../styles/modules/forms.module.css';

export const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [roleFilter, setRoleFilter] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const { data: direcciones = [] } = useDireccionesOptions();

  const filters: UsersFilters = {
    search,
    active: activeFilter,
    role_id: roleFilter,
    page,
    limit,
    orderBy: 'created_at',
    orderDirection: 'DESC',
  };

  const { data: usersData, isLoading, error, isError } = useAdminUsers(filters);
  const createUserMutation = useCreateUser();
  const updateUserStatusMutation = useUpdateUserStatus();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const verifyUserEmailMutation = useVerifyUserEmail();

  useEffect(() => {
    if (isError) {
      console.error('Error al cargar usuarios:', error);
    }
    if (usersData) {
      console.log('Usuarios cargados:', usersData);
    }
  }, [isError, error, usersData]);

  const users: User[] = (usersData as UsersResponse | undefined)?.users || [];
  const pagination = (usersData as UsersResponse | undefined)?.pagination || {
    page: 1,
    limit,
    total: 0,
    totalPages: 0,
  };

  useEffect(() => {
    if (user?.role !== 'administrator') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSearch = () => {
    setSearch(searchTerm || undefined);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSearch(undefined);
    setActiveFilter(undefined);
    setRoleFilter(undefined);
    setPage(1);
  };

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const full_name = formData.get('full_name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;
    const incident_area_id = formData.get('incident_area_id') ? Number(formData.get('incident_area_id')) : undefined;
    const role_id = formData.get('role_id') ? Number(formData.get('role_id')) : 3;
    const active = formData.get('active') === 'on';

    createUserMutation.mutate(
      {
        full_name,
        email,
        password,
        phone: phone || undefined,
        incident_area_id,
        role_id,
        active,
      },
      {
        onSuccess: () => {
          setShowCreateForm(false);
          setShowCreatePassword(false);
          (e.target as HTMLFormElement).reset();
        },
      }
    );
  };

  const handleToggleUserStatus = (user: User) => {
    setUserToToggle(user);
  };

  const confirmToggleStatus = () => {
    if (!userToToggle) return;
    updateUserStatusMutation.mutate({
      id: userToToggle.id,
      data: { active: !userToToggle.active },
    });
    setUserToToggle(null);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setShowEditForm(true);
  };

  const handleUpdateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userToEdit) return;

    const formData = new FormData(e.currentTarget);
    const full_name = formData.get('full_name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;
    const incident_area_id = formData.get('incident_area_id') ? Number(formData.get('incident_area_id')) : undefined;
    const role_id = formData.get('role_id') ? Number(formData.get('role_id')) : undefined;
    const active = formData.get('active') === 'on';

    const updateData: UpdateUserData = {
      full_name,
      email,
      phone: phone || undefined,
      incident_area_id,
      role_id,
      active,
    };

    if (password && password.trim() !== '') {
      updateData.password = password;
    }

    updateUserMutation.mutate(
      {
        id: userToEdit.id,
        data: updateData,
      },
      {
        onSuccess: () => {
          setShowEditForm(false);
          setShowEditPassword(false);
          setUserToEdit(null);
        },
      }
    );
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    deleteUserMutation.mutate(userToDelete.id, {
      onSuccess: () => {
        setUserToDelete(null);
      },
    });
  };

  const handleVerifyUserEmail = (user: User) => {
    if (user.email_verified) {
      return;
    }
    verifyUserEmailMutation.mutate(user.id);
  };

  const getRoleName = (role: string): string => {
    switch (role) {
      case 'administrator':
        return 'Administrador';
      case 'technician':
        return 'Técnico';
      case 'end_user':
        return 'Usuario Final';
      default:
        return role;
    }
  };

  const getDireccionName = (incidentAreaId?: number | null): string => {
    if (!incidentAreaId) return '-';
    const direccion = direcciones.find((dir) => dir.id === incidentAreaId);
    return direccion?.name || '-';
  };

  const activeUsersCount = users.filter((u) => u.active).length;
  const inactiveUsersCount = users.filter((u) => !u.active).length;
  const verifiedUsersCount = users.filter((u) => u.email_verified).length;

  const getRoleId = (roleName: string): number => {
    switch (roleName) {
      case 'administrator':
        return 1;
      case 'technician':
        return 2;
      case 'end_user':
        return 3;
      default:
        return 3;
    }
  };

  const loading = isLoading;

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="page-heading">Gestión de Usuarios</h1>
              <p className="page-subheading">
                Administra y gestiona todos los usuarios del sistema
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Crear Usuario</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="stat-card stat-card--sky">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="stat-card-title">Total Usuarios</p>
                  <p className="stat-card-value">{pagination.total}</p>
                </div>
                <div className="stat-card-icon stat-card-icon--sky">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="stat-card stat-card--emerald">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="stat-card-title">Usuarios Activos</p>
                  <p className="stat-card-value">{activeUsersCount}</p>
                </div>
                <div className="stat-card-icon stat-card-icon--emerald">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="stat-card stat-card--amber">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="stat-card-title">Usuarios Inactivos</p>
                  <p className="stat-card-value">{inactiveUsersCount}</p>
                </div>
                <div className="stat-card-icon stat-card-icon--amber">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="stat-card stat-card--violet">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="stat-card-title">Emails Verificados</p>
                  <p className="stat-card-value">{verifiedUsersCount}</p>
                </div>
                <div className="stat-card-icon stat-card-icon--violet">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="content-panel mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-5">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-sky-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <h2 className="text-lg sm:text-xl font-semibold text-white">Filtros de Búsqueda</h2>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn-secondary flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap"
                aria-label="Limpiar todos los filtros"
              >
                <ClearFiltersIcon className="w-4 h-4" />
                <span>Limpiar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div className="min-w-0">
                <label className="label-field flex items-center gap-2 !mb-2">
                  <svg
                    className="w-4 h-4 text-sky-300 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>Buscar</span>
                </label>
                <div className="flex min-w-0 shadow-sm">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);
                      if (value === '') {
                        setSearch(undefined);
                        setPage(1);
                      }
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Nombre o email..."
                    className="input-field flex-1 min-w-0 rounded-l-xl rounded-r-none border-r-0"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="btn-primary px-5 py-2.5 rounded-l-none rounded-r-xl flex-shrink-0"
                    aria-label="Buscar usuarios"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="min-w-0">
                <label className="label-field flex items-center gap-2 !mb-2">
                  <svg
                    className="w-4 h-4 text-emerald-300 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Estado</span>
                </label>
                <div className="relative">
                  <select
                    value={activeFilter === undefined ? '' : activeFilter ? 'true' : 'false'}
                    onChange={(e) => {
                      const value = e.target.value;
                      setActiveFilter(value === '' ? undefined : value === 'true');
                      setPage(1);
                    }}
                    className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
                  >
                    <option value="">Todos</option>
                    <option value="true">Activos</option>
                    <option value="false">Inactivos</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <label className="label-field flex items-center gap-2 !mb-2">
                  <svg
                    className="w-4 h-4 text-violet-300 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Rol</span>
                </label>
                <div className="relative">
                  <select
                    value={roleFilter || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRoleFilter(value === '' ? undefined : Number(value));
                      setPage(1);
                    }}
                    className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
                  >
                    <option value="">Todos</option>
                    <option value="1">Administrador</option>
                    <option value="2">Técnico</option>
                    <option value="3">Usuario Final</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showCreateForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
              <div className="card max-h-[95vh] w-full max-w-2xl overflow-y-auto !p-5 sm:max-h-[90vh] sm:!p-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white sm:text-2xl">Crear usuario</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setShowCreatePassword(false);
                      }}
                      className="rounded-lg p-2 text-sky-200/70 transition-colors hover:bg-sky-500/15 hover:text-white"
                      aria-label="Cerrar"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className={formStyles.formGroup}>
                      <label className="label-field">
                        Nombre completo
                        <span className="text-red-300/90" aria-hidden>
                          {' '}
                          *
                        </span>
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        required
                        className="input-dark"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div className={formStyles.formGroup}>
                      <label className="label-field">
                        Email
                        <span className="text-red-300/90" aria-hidden>
                          {' '}
                          *
                        </span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="input-dark"
                        placeholder="usuario@email.com"
                      />
                    </div>
                    <div className={formStyles.formGroup}>
                      <label className="label-field">
                        Contraseña
                        <span className="text-red-300/90" aria-hidden>
                          {' '}
                          *
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showCreatePassword ? 'text' : 'password'}
                          name="password"
                          required
                          minLength={8}
                          className="input-dark w-full pr-10"
                          placeholder="Mínimo 8 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCreatePassword(!showCreatePassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-200/70 transition-colors hover:text-white"
                          aria-label={showCreatePassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showCreatePassword ? (
                            <svg
                              className="h-5 w-5 transition-all duration-150 ease-out"
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
                            <svg
                              className="h-5 w-5 transition-all duration-150 ease-out"
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
                      <p className="mt-1.5 text-xs text-blue-100/70">
                        Mínimo 8 caracteres, una mayúscula, una minúscula y un número
                      </p>
                    </div>
                    <div className={formStyles.formGroup}>
                      <label className="label-field">
                        Teléfono
                        <span className="font-normal text-blue-100/50"> (opcional)</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className="input-dark"
                        placeholder="+1234567890"
                      />
                    </div>
                    <div className={formStyles.formGroup}>
                      <label className="label-field">
                        Dirección
                        <span className="text-red-300/90" aria-hidden>
                          {' '}
                          *
                        </span>
                      </label>
                      <select
                        name="incident_area_id"
                        required
                        className={`input-dark ${formStyles.selectField}`}
                      >
                        <option value="">Selecciona una dirección</option>
                        {direcciones.map((dir) => (
                          <option key={dir.id} value={dir.id}>
                            {dir.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={formStyles.formGroup}>
                      <label className="label-field">
                        Rol
                        <span className="text-red-300/90" aria-hidden>
                          {' '}
                          *
                        </span>
                      </label>
                      <select
                        name="role_id"
                        required
                        className={`input-dark ${formStyles.selectField}`}
                        defaultValue={3}
                      >
                        <option value={1}>Administrador</option>
                        <option value={2}>Técnico</option>
                        <option value={3}>Usuario Final</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="active"
                        id="active"
                        className="rounded border-sky-400/40 bg-slate-900/50 text-sky-500 focus:ring-sky-400/50"
                      />
                      <label htmlFor="active" className="text-sm text-blue-100/85">
                        Usuario activo
                      </label>
                    </div>
                    <footer className="flex flex-col-reverse gap-3 border-t border-sky-400/20 pt-5 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setShowCreatePassword(false);
                        }}
                        className="btn-secondary w-full sm:w-auto"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn-primary w-full sm:w-auto sm:min-w-[10rem]"
                        disabled={createUserMutation.isPending}
                      >
                        {createUserMutation.isPending ? 'Creando…' : 'Crear usuario'}
                      </button>
                    </footer>
                  </form>
              </div>
            </div>
          )}

          {userToToggle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="card w-full max-w-md !p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  {userToToggle.active ? 'Desactivar usuario' : 'Activar usuario'}
                </h3>
                <p className="mb-6 text-blue-100/85">
                  ¿Estás seguro de que deseas {userToToggle.active ? 'desactivar' : 'activar'} a{' '}
                  <strong className="text-white">{userToToggle.full_name}</strong> ({userToToggle.email})?
                </p>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setUserToToggle(null)} className="btn-secondary w-full sm:w-auto">
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmToggleStatus}
                    className={userToToggle.active ? 'btn-warning w-full sm:w-auto' : 'btn-primary w-full sm:w-auto'}
                    disabled={updateUserStatusMutation.isPending}
                  >
                    {updateUserStatusMutation.isPending
                      ? 'Procesando…'
                      : userToToggle.active
                        ? 'Desactivar'
                        : 'Activar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showEditForm && userToEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
              <div className="card max-h-[95vh] w-full max-w-2xl overflow-y-auto !p-5 sm:max-h-[90vh] sm:!p-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white sm:text-2xl">Editar usuario</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setShowEditPassword(false);
                        setUserToEdit(null);
                      }}
                      className="rounded-lg p-2 text-sky-200/70 transition-colors hover:bg-sky-500/15 hover:text-white"
                      aria-label="Cerrar"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div className={formStyles.formGroup}>
                      <label className="label-field">
                        Nombre completo
                        <span className="text-red-300/90" aria-hidden>
                          {' '}
                          *
                        </span>
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        required
                        defaultValue={userToEdit.full_name}
                        className="input-dark"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div className={formStyles.formGroup}>
                      <label className="label-field">
                        Email
                        <span className="text-red-300/90" aria-hidden>
                          {' '}
                          *
                        </span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        defaultValue={userToEdit.email}
                        className="input-dark"
                        placeholder="usuario@email.com"
                      />
                    </div>
                    <div className={formStyles.formGroup}>
                      <label className="label-field">
                        Contraseña
                        <span className="font-normal text-blue-100/50"> (opcional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showEditPassword ? 'text' : 'password'}
                          name="password"
                          className="input-dark w-full pr-10"
                          placeholder="Nueva contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-200/70 transition-colors hover:text-white"
                          aria-label={showEditPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showEditPassword ? (
                            <svg
                              className="h-5 w-5 transition-all duration-150 ease-out"
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
                            <svg
                              className="h-5 w-5 transition-all duration-150 ease-out"
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
                      <p className="mt-1.5 text-xs text-blue-100/70">
                        Mínimo 8 caracteres, una mayúscula, una minúscula y un número
                      </p>
                    </div>
                    <div className={formStyles.formGroup}>
                      <label className="label-field">
                        Teléfono
                        <span className="font-normal text-blue-100/50"> (opcional)</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        defaultValue={userToEdit.phone || ''}
                        className="input-dark"
                        placeholder="+1234567890"
                      />
                    </div>
                    <div className={formStyles.formGroup}>
                      <label className="label-field">
                        Dirección
                        <span className="text-red-300/90" aria-hidden>
                          {' '}
                          *
                        </span>
                      </label>
                      <select
                        name="incident_area_id"
                        required
                        className={`input-dark ${formStyles.selectField}`}
                        defaultValue={userToEdit.incident_area_id || ''}
                      >
                        <option value="">Selecciona una dirección</option>
                        {direcciones.map((dir) => (
                          <option key={dir.id} value={dir.id}>
                            {dir.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={formStyles.formGroup}>
                      <label className="label-field">
                        Rol
                        <span className="text-red-300/90" aria-hidden>
                          {' '}
                          *
                        </span>
                      </label>
                      <select
                        name="role_id"
                        required
                        className={`input-dark ${formStyles.selectField}`}
                        defaultValue={getRoleId(userToEdit.role)}
                      >
                        <option value={1}>Administrador</option>
                        <option value={2}>Técnico</option>
                        <option value={3}>Usuario Final</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="active"
                        id="edit-active"
                        defaultChecked={userToEdit.active}
                        className="rounded border-sky-400/40 bg-slate-900/50 text-sky-500 focus:ring-sky-400/50"
                      />
                      <label htmlFor="edit-active" className="text-sm text-blue-100/85">
                        Usuario activo
                      </label>
                    </div>
                    <footer className="flex flex-col-reverse gap-3 border-t border-sky-400/20 pt-5 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditForm(false);
                          setShowEditPassword(false);
                          setUserToEdit(null);
                        }}
                        className="btn-secondary w-full sm:w-auto"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn-primary w-full sm:w-auto sm:min-w-[10rem]"
                        disabled={updateUserMutation.isPending}
                      >
                        {updateUserMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
                      </button>
                    </footer>
                  </form>
              </div>
            </div>
          )}

          {userToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
              <div className="card w-full max-w-md !p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">Eliminar usuario</h3>
                <p className="mb-6 text-blue-100/85">
                  ¿Estás seguro de que deseas eliminar a{' '}
                  <strong className="text-white">{userToDelete.full_name}</strong> ({userToDelete.email})?
                  <span className="mt-2 block text-sm text-red-300/90">Esta acción no se puede deshacer.</span>
                </p>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setUserToDelete(null)} className="btn-secondary w-full sm:w-auto">
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteUser}
                    className="btn-danger w-full sm:w-auto"
                    disabled={deleteUserMutation.isPending}
                  >
                    {deleteUserMutation.isPending ? 'Eliminando…' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="card py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sky-400 border-t-transparent" />
              <p className="mt-3 text-blue-100/85">Cargando usuarios…</p>
            </div>
          ) : isError ? (
            <div className="card py-12 text-center px-4">
              <p className="text-red-200 font-semibold">Error al cargar usuarios</p>
              <p className="text-blue-100/80 mt-2">Por favor, intenta de nuevo.</p>
              {error && typeof error === 'object' && 'response' in error && (
                <p className="text-sm text-blue-100/60 mt-2">
                  {(error as { response?: { data?: { message?: string } } }).response?.data?.message ||
                    'Error desconocido'}
                </p>
              )}
            </div>
          ) : users.length === 0 ? (
            <div className="card py-12 text-center px-4">
              <p className="text-blue-100/80">No se encontraron usuarios.</p>
              <p className="text-sm text-blue-100/60 mt-2">
                {pagination.total === 0
                  ? 'No hay usuarios registrados en el sistema.'
                  : 'Intenta ajustar los filtros de búsqueda.'}
              </p>
            </div>
          ) : (
            <>
          <div className="card !p-0 overflow-hidden">
                <div className="tickets-list-light overflow-x-auto bg-white/95">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                          Email
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                          Dirección
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Email Verificado
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                          Fecha Creación
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                                {user.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</div>
                                <div className="text-xs text-gray-500 md:hidden mt-0.5 truncate">{user.email}</div>
                                {user.phone && (
                                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="hidden sm:inline">{user.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                            <div className="text-sm text-gray-900 flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="truncate">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                            <div className="text-sm text-gray-900">
                              {getDireccionName(user.incident_area_id)}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              {getRoleName(user.role)}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                                user.active
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-red-100 text-red-800 border-red-200'
                              }`}
                            >
                              {user.active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                                user.email_verified
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }`}
                            >
                              {user.email_verified ? 'Verificado' : 'No Verificado'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell text-sm text-gray-500">
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : '-'}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center justify-end flex-wrap gap-2">
                              {!user.email_verified && (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyUserEmail(user)}
                                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:from-green-600 hover:to-green-700 disabled:opacity-50 whitespace-nowrap"
                                  title="Verificar email"
                                  disabled={verifyUserEmailMutation.isPending}
                                >
                                  {verifyUserEmailMutation.isPending ? '…' : 'Verificar'}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(user)}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium shadow-md whitespace-nowrap ${
                                  user.active
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700'
                                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                                }`}
                                title={user.active ? 'Desactivar usuario' : 'Activar usuario'}
                              >
                                <span className="inline-flex items-center gap-1">
                                  <ToggleIcon className="h-4 w-4" active={!user.active} />
                                  <span className="hidden lg:inline">{user.active ? 'Desactivar' : 'Activar'}</span>
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditUser(user)}
                                className="group p-2 sm:p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 flex items-center justify-center"
                                title="Editar usuario"
                              >
                                <EditIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user)}
                                className="group p-2 sm:p-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-700 flex items-center justify-center"
                                title="Eliminar usuario"
                              >
                                <DeleteIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
          </div>

              {pagination.totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs sm:text-sm text-blue-50/90 text-center sm:text-left">
                    Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, pagination.total)} de{' '}
                    {pagination.total} usuarios
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                      disabled={page === pagination.totalPages}
                      className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
