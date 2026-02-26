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
import type { User } from '../types';
import type { UsersFilters, UpdateUserData, UsersResponse } from '../services/adminService';

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTerm || undefined);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
                <p className="text-gray-600">Administra y gestiona todos los usuarios del sistema</p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg hover:shadow-xl transition-shadow"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Crear Usuario</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Total Usuarios</p>
                    <p className="text-3xl font-bold">{pagination.total}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Usuarios Activos</p>
                    <p className="text-3xl font-bold">{activeUsersCount}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium mb-1">Usuarios Inactivos</p>
                    <p className="text-3xl font-bold">{inactiveUsersCount}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Emails Verificados</p>
                    <p className="text-3xl font-bold">{verifiedUsersCount}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros de Búsqueda</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nombre o email..."
                    className="input-field w-full pl-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={activeFilter === undefined ? '' : activeFilter ? 'true' : 'false'}
                  onChange={(e) => {
                    const value = e.target.value;
                    setActiveFilter(value === '' ? undefined : value === 'true');
                    setPage(1);
                  }}
                  className="input-field w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  value={roleFilter || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRoleFilter(value === '' ? undefined : Number(value));
                    setPage(1);
                  }}
                  className="input-field w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Todos</option>
                  <option value="1">Administrador</option>
                  <option value="2">Técnico</option>
                  <option value="3">Usuario Final</option>
                </select>
              </div>
            </div>
          </div>

          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Crear Usuario</h2>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        required
                        className="input-field w-full"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="input-field w-full"
                        placeholder="usuario@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        name="password"
                        required
                        minLength={8}
                        className="input-field w-full"
                        placeholder="Mínimo 8 caracteres"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo 8 caracteres, una mayúscula, una minúscula y un número
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className="input-field w-full"
                        placeholder="+1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                      </label>
                      <select name="incident_area_id" className="input-field w-full">
                        <option value="">Selecciona una dirección</option>
                        {direcciones.map((dir) => (
                          <option key={dir.id} value={dir.id}>
                            {dir.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rol *
                      </label>
                      <select name="role_id" required className="input-field w-full" defaultValue={3}>
                        <option value={1}>Administrador</option>
                        <option value={2}>Técnico</option>
                        <option value={3}>Usuario Final</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="active"
                        id="active"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                        Usuario activo
                      </label>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="btn-secondary"
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn-primary" disabled={createUserMutation.isPending}>
                        {createUserMutation.isPending ? 'Creando...' : 'Crear Usuario'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {userToToggle && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {userToToggle.active ? 'Desactivar Usuario' : 'Activar Usuario'}
                </h3>
                <p className="text-gray-700 mb-6">
                  ¿Estás seguro de que deseas {userToToggle.active ? 'desactivar' : 'activar'} a{' '}
                  <strong>{userToToggle.full_name}</strong> ({userToToggle.email})?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setUserToToggle(null)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmToggleStatus}
                    className={userToToggle.active ? 'btn-warning' : 'btn-primary'}
                    disabled={updateUserStatusMutation.isPending}
                  >
                    {updateUserStatusMutation.isPending
                      ? 'Procesando...'
                      : userToToggle.active
                      ? 'Desactivar'
                      : 'Activar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showEditForm && userToEdit && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Editar Usuario</h2>
                    <button
                      onClick={() => {
                        setShowEditForm(false);
                        setUserToEdit(null);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        required
                        defaultValue={userToEdit.full_name}
                        className="input-field w-full"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        defaultValue={userToEdit.email}
                        className="input-field w-full"
                        placeholder="usuario@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña (dejar vacío para no cambiar)
                      </label>
                      <input
                        type="password"
                        name="password"
                        className="input-field w-full"
                        placeholder="Nueva contraseña (opcional)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo 8 caracteres, una mayúscula, una minúscula y un número
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        defaultValue={userToEdit.phone || ''}
                        className="input-field w-full"
                        placeholder="+1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                      </label>
                      <select name="incident_area_id" className="input-field w-full" defaultValue={userToEdit.incident_area_id || ''}>
                        <option value="">Selecciona una dirección</option>
                        {direcciones.map((dir) => (
                          <option key={dir.id} value={dir.id}>
                            {dir.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rol *
                      </label>
                      <select name="role_id" required className="input-field w-full" defaultValue={getRoleId(userToEdit.role)}>
                        <option value={1}>Administrador</option>
                        <option value={2}>Técnico</option>
                        <option value={3}>Usuario Final</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="active"
                        id="edit-active"
                        defaultChecked={userToEdit.active}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="edit-active" className="ml-2 text-sm text-gray-700">
                        Usuario activo
                      </label>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditForm(false);
                          setUserToEdit(null);
                        }}
                        className="btn-secondary"
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn-primary" disabled={updateUserMutation.isPending}>
                        {updateUserMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {userToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Eliminar Usuario</h3>
                <p className="text-gray-700 mb-6">
                  ¿Estás seguro de que deseas eliminar a <strong>{userToDelete.full_name}</strong> ({userToDelete.email})?
                  <br />
                  <span className="text-sm text-red-600 mt-2 block">
                    Esta acción no se puede deshacer.
                  </span>
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setUserToDelete(null)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeleteUser}
                    className="btn-danger"
                    disabled={deleteUserMutation.isPending}
                  >
                    {deleteUserMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
                <p className="mt-4 text-gray-600 font-medium">Cargando usuarios...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-600 font-semibold text-lg">Error al cargar usuarios</p>
                <p className="text-gray-500 mt-2">Por favor, intenta de nuevo</p>
                {error && typeof error === 'object' && 'response' in error && (
                  <p className="text-sm text-gray-400 mt-2">
                    {(error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error desconocido'}
                  </p>
                )}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-semibold text-lg">No se encontraron usuarios</p>
                <p className="text-sm text-gray-500 mt-2">
                  {pagination.total === 0 
                    ? 'No hay usuarios registrados en el sistema' 
                    : 'Intenta ajustar los filtros de búsqueda'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Dirección
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Email Verificado
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Fecha Creación
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                                {user.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{user.full_name}</div>
                                {user.phone && (
                                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {user.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {getDireccionName(user.incident_area_id)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              {getRoleName(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
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
                          <td className="px-6 py-4 whitespace-nowrap">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                                title="Editar usuario"
                              >
                                <EditIcon className="h-4 w-4" />
                                <span className="hidden lg:inline">Editar</span>
                              </button>
                              {!user.email_verified && (
                                <button
                                  onClick={() => handleVerifyUserEmail(user)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors"
                                  title="Verificar email"
                                  disabled={verifyUserEmailMutation.isPending}
                                >
                                  <span className="text-sm">✓</span>
                                  <span className="hidden lg:inline">Verificar</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleUserStatus(user)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                                  user.active
                                    ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50'
                                    : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                                }`}
                                title={user.active ? 'Desactivar usuario' : 'Activar usuario'}
                              >
                                <ToggleIcon className="h-4 w-4" active={!user.active} />
                                <span className="hidden lg:inline">{user.active ? 'Desactivar' : 'Activar'}</span>
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                                title="Eliminar usuario"
                              >
                                <DeleteIcon className="h-4 w-4" />
                                <span className="hidden lg:inline">Eliminar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pagination.totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                        disabled={page === pagination.totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Mostrando <span className="font-semibold">{(page - 1) * limit + 1}</span> a{' '}
                          <span className="font-semibold">
                            {Math.min(page * limit, pagination.total)}
                          </span>{' '}
                          de <span className="font-semibold">{pagination.total}</span> resultados
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Anterior
                          </button>
                          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                                pageNum === page
                                  ? 'z-10 bg-primary-600 border-primary-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                          <button
                            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                            disabled={page === pagination.totalPages}
                            className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Siguiente
                          </button>
                        </nav>
                      </div>
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
