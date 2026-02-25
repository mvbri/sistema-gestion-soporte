import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import {
  useAdminCategorias,
  useAdminPrioridades,
  useAdminDirecciones,
  useAdminEquipmentTypes,
  useAdminConsumableTypes,
  useCreateCategoria,
  useUpdateCategoria,
  useDeleteCategoria,
  useCreatePrioridad,
  useUpdatePrioridad,
  useDeletePrioridad,
  useCreateDireccion,
  useUpdateDireccion,
  useDeleteDireccion,
  useCreateEquipmentType,
  useUpdateEquipmentType,
  useDeleteEquipmentType,
  useCreateConsumableType,
  useUpdateConsumableType,
  useDeleteConsumableType,
} from '../hooks/useAdmin';
import type { CategoriaTicket, PrioridadTicket, DireccionTicket, EquipmentType, ConsumableType } from '../types';

export const AdminConfig: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'categorias' | 'prioridades' | 'direcciones' | 'equipment-types' | 'consumable-types'>('categorias');
  const [editingCategoria, setEditingCategoria] = useState<CategoriaTicket | null>(null);
  const [editingPrioridad, setEditingPrioridad] = useState<PrioridadTicket | null>(null);
  const [editingDireccion, setEditingDireccion] = useState<DireccionTicket | null>(null);
  const [editingEquipmentType, setEditingEquipmentType] = useState<EquipmentType | null>(null);
  const [editingConsumableType, setEditingConsumableType] = useState<ConsumableType | null>(null);
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const [showPrioridadForm, setShowPrioridadForm] = useState(false);
  const [showDireccionForm, setShowDireccionForm] = useState(false);
  const [showEquipmentTypeForm, setShowEquipmentTypeForm] = useState(false);
  const [showConsumableTypeForm, setShowConsumableTypeForm] = useState(false);
  const [prioridadNivel, setPrioridadNivel] = useState<string>('');
  const [prioridadColor, setPrioridadColor] = useState<string>('');
  const [categoriaToDelete, setCategoriaToDelete] = useState<CategoriaTicket | null>(null);
  const [prioridadToDelete, setPrioridadToDelete] = useState<PrioridadTicket | null>(null);
  const [direccionToDelete, setDireccionToDelete] = useState<DireccionTicket | null>(null);
  const [equipmentTypeToDelete, setEquipmentTypeToDelete] = useState<EquipmentType | null>(null);
  const [consumableTypeToDelete, setConsumableTypeToDelete] = useState<ConsumableType | null>(null);
  const [direccionesSearchTerm, setDireccionesSearchTerm] = useState('');
  const [direccionesSearch, setDireccionesSearch] = useState<string | undefined>(undefined);
  const [direccionesPage, setDireccionesPage] = useState(1);
  const [direccionesLimit] = useState(5);
  const [direccionesOrderBy] = useState<'name' | 'description' | 'active' | 'created_at' | 'updated_at'>('name');
  const [direccionesOrderDirection, setDireccionesOrderDirection] = useState<'ASC' | 'DESC'>('ASC');

  const { data: categorias = [], isLoading: loadingCategorias } = useAdminCategorias();
  const { data: prioridades = [], isLoading: loadingPrioridades } = useAdminPrioridades();
  const { data: equipmentTypes = [], isLoading: loadingEquipmentTypes } = useAdminEquipmentTypes();
  const { data: consumableTypes = [], isLoading: loadingConsumableTypes } = useAdminConsumableTypes();
  const { 
    data: direccionesData, 
    isLoading: loadingDirecciones 
  } = useAdminDirecciones({
    search: direccionesSearch,
    page: direccionesPage,
    limit: direccionesLimit,
    orderBy: direccionesOrderBy,
    orderDirection: direccionesOrderDirection,
  });

  const direcciones = Array.isArray(direccionesData?.direcciones) ? direccionesData.direcciones : [];
  const direccionesPagination = direccionesData?.pagination || {
    page: 1,
    limit: direccionesLimit,
    total: 0,
    totalPages: 0,
  };
  const createCategoriaMutation = useCreateCategoria();
  const updateCategoriaMutation = useUpdateCategoria();
  const deleteCategoriaMutation = useDeleteCategoria();
  const createPrioridadMutation = useCreatePrioridad();
  const updatePrioridadMutation = useUpdatePrioridad();
  const deletePrioridadMutation = useDeletePrioridad();
  const createDireccionMutation = useCreateDireccion();
  const updateDireccionMutation = useUpdateDireccion();
  const deleteDireccionMutation = useDeleteDireccion();
  const createEquipmentTypeMutation = useCreateEquipmentType();
  const updateEquipmentTypeMutation = useUpdateEquipmentType();
  const deleteEquipmentTypeMutation = useDeleteEquipmentType();
  const createConsumableTypeMutation = useCreateConsumableType();
  const updateConsumableTypeMutation = useUpdateConsumableType();
  const deleteConsumableTypeMutation = useDeleteConsumableType();

  const loading = loadingCategorias || loadingPrioridades || loadingDirecciones || loadingEquipmentTypes || loadingConsumableTypes;

  useEffect(() => {
    if (user?.role !== 'administrator') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleCreateCategoria = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    createCategoriaMutation.mutate(
      { name, description },
      {
        onSuccess: () => {
          setShowCategoriaForm(false);
        },
      }
    );
  };

  const handleUpdateCategoria = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategoria) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const active = formData.get('active') === 'on';

    updateCategoriaMutation.mutate(
      {
        id: editingCategoria.id,
        data: { name, description, active },
      },
      {
        onSuccess: () => {
          setEditingCategoria(null);
        },
      }
    );
  };

  const handleDeleteCategoria = () => {
    if (!categoriaToDelete) return;
    deleteCategoriaMutation.mutate(categoriaToDelete.id, {
      onSuccess: () => {
        setCategoriaToDelete(null);
      },
    });
  };

  const getColorByNivel = (nivel: string): string => {
    switch (nivel) {
      case '1':
        return 'bg-green-100';
      case '2':
        return 'bg-yellow-100';
      case '3':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  const handleNivelChange = (nivel: string) => {
    setPrioridadNivel(nivel);
    setPrioridadColor(getColorByNivel(nivel));
  };

  const handleCreatePrioridad = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const level = parseInt(formData.get('level') as string);
    const color = prioridadColor || getColorByNivel(level.toString());
    const description = formData.get('description') as string;

    createPrioridadMutation.mutate(
      { name, level, color, description },
      {
        onSuccess: () => {
          setShowPrioridadForm(false);
          setPrioridadNivel('');
          setPrioridadColor('');
        },
      }
    );
  };

  const handleUpdatePrioridad = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPrioridad) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const level = parseInt(formData.get('level') as string);
    const color = prioridadColor || getColorByNivel(level.toString());
    const description = formData.get('description') as string;
    const active = formData.get('active') === 'on';

    updatePrioridadMutation.mutate(
      {
        id: editingPrioridad.id,
        data: { name, level, color, description, active },
      },
      {
        onSuccess: () => {
          setEditingPrioridad(null);
          setPrioridadNivel('');
          setPrioridadColor('');
        },
      }
    );
  };

  const handleDeletePrioridad = () => {
    if (!prioridadToDelete) return;
    deletePrioridadMutation.mutate(prioridadToDelete.id, {
      onSuccess: () => {
        setPrioridadToDelete(null);
      },
    });
  };

  const handleCreateDireccion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    createDireccionMutation.mutate(
      { name, description },
      {
        onSuccess: () => {
          setShowDireccionForm(false);
        },
      }
    );
  };

  const handleUpdateDireccion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingDireccion) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const active = formData.get('active') === 'on';

    updateDireccionMutation.mutate(
      {
        id: editingDireccion.id,
        data: { name, description, active },
      },
      {
        onSuccess: () => {
          setEditingDireccion(null);
        },
      }
    );
  };

  const handleDeleteDireccion = () => {
    if (!direccionToDelete) return;
    deleteDireccionMutation.mutate(direccionToDelete.id, {
      onSuccess: () => {
        setDireccionToDelete(null);
      },
    });
  };

  const handleDireccionesSearch = () => {
    setDireccionesSearch(direccionesSearchTerm || undefined);
    setDireccionesPage(1);
  };

  const handleClearDireccionesSearch = () => {
    setDireccionesSearchTerm('');
    setDireccionesSearch(undefined);
    setDireccionesPage(1);
  };

  const handleCreateEquipmentType = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    createEquipmentTypeMutation.mutate(
      { name, description },
      {
        onSuccess: () => {
          setShowEquipmentTypeForm(false);
        },
      }
    );
  };

  const handleUpdateEquipmentType = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEquipmentType) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const active = formData.get('active') === 'on';

    updateEquipmentTypeMutation.mutate(
      {
        id: editingEquipmentType.id,
        data: { name, description, active },
      },
      {
        onSuccess: () => {
          setEditingEquipmentType(null);
        },
      }
    );
  };

  const handleDeleteEquipmentType = () => {
    if (!equipmentTypeToDelete) return;
    deleteEquipmentTypeMutation.mutate(equipmentTypeToDelete.id, {
      onSuccess: () => {
        setEquipmentTypeToDelete(null);
      },
    });
  };

  if (user?.role !== 'administrator') {
    return null;
  }

  if (loading) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando...</p>
          </div>
        </div>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <MainNavbar />
      <PageWrapper>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Administración</h1>
          <p className="text-gray-600 mt-2">Gestiona categorías, prioridades, direcciones, tipos de equipos y tipos de consumibles del sistema</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('categorias')}
                className={`py-4 px-6 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'categorias'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                Categorías
              </button>
              <button
                onClick={() => setActiveTab('prioridades')}
                className={`py-4 px-6 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'prioridades'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                Prioridades
              </button>
              <button
                onClick={() => setActiveTab('direcciones')}
                className={`py-4 px-6 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'direcciones'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                Direcciones
              </button>
              <button
                onClick={() => setActiveTab('equipment-types')}
                className={`py-4 px-6 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'equipment-types'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                Tipos de Equipos
              </button>
              <button
                onClick={() => setActiveTab('consumable-types')}
                className={`py-4 px-6 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'consumable-types'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                Tipos de Consumibles
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'categorias' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Categorías</h2>
                  <button
                    onClick={() => {
                      setShowCategoriaForm(true);
                      setEditingCategoria(null);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Nueva Categoría
                  </button>
                </div>

                {showCategoriaForm && !editingCategoria && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Crear Categoría</h3>
                    <form onSubmit={handleCreateCategoria} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Crear
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCategoriaForm(false)}
                          className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium bg-white hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {editingCategoria && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Editar Categoría</h3>
                    <form onSubmit={handleUpdateCategoria} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={editingCategoria.name}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          name="description"
                          defaultValue={editingCategoria.description || ''}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="active"
                            defaultChecked={editingCategoria.active}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Activa</span>
                        </label>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCategoria(null)}
                          className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium bg-white hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-2">
                  {categorias.map((categoria) => (
                    <div
                      key={categoria.id}
                      className={`p-4 border rounded-lg flex justify-between items-center ${
                        !categoria.active ? 'bg-gray-100 opacity-60' : 'bg-white'
                      }`}
                    >
                      <div>
                        <h3 className="font-medium">{categoria.name}</h3>
                        {categoria.description && (
                          <p className="text-sm text-gray-500">{categoria.description}</p>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            categoria.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {categoria.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingCategoria(categoria);
                            setShowCategoriaForm(false);
                          }}
                          className="group p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center"
                          title="Editar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setCategoriaToDelete(categoria)}
                          className="group p-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center"
                          title="Eliminar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'prioridades' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Prioridades</h2>
                    <button
                      onClick={() => {
                        setShowPrioridadForm(true);
                        setEditingPrioridad(null);
                        setPrioridadNivel('');
                        setPrioridadColor('');
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Nueva Prioridad
                    </button>
                </div>

                {showPrioridadForm && !editingPrioridad && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Crear Prioridad</h3>
                    <form onSubmit={handleCreatePrioridad} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nivel (orden numérico) <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="level"
                          required
                          value={prioridadNivel}
                          onChange={(e) => handleNivelChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seleccione un nivel</option>
                          <option value="1">1 - Baja</option>
                          <option value="2">2 - Media</option>
                          <option value="3">3 - Alta</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          El nombre es la etiqueta visible (ej. Altísima). El nivel es el valor numérico interno para ordenar y reglas de negocio.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color (asignado automáticamente)
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            name="color"
                            value={prioridadColor}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                          {prioridadColor && (
                            <span className={`px-3 py-2 rounded ${prioridadColor} text-gray-800 text-sm font-medium`}>
                              Vista previa
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          El color se asigna automáticamente: Baja (verde), Media (amarillo), Alta (rojo)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Crear
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPrioridadForm(false)}
                          className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium bg-white hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {editingPrioridad && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Editar Prioridad</h3>
                    <form onSubmit={handleUpdatePrioridad} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={editingPrioridad.name}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nivel (orden numérico) <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="level"
                          defaultValue={editingPrioridad.level.toString()}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="1">1 - Baja</option>
                          <option value="2">2 - Media</option>
                          <option value="3">3 - Alta</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          El nombre es la etiqueta visible (ej. Altísima). El nivel es el valor numérico interno para ordenar y reglas de negocio.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color (Tailwind CSS) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="color"
                          defaultValue={editingPrioridad.color}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          name="description"
                          defaultValue={editingPrioridad.description || ''}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="active"
                            defaultChecked={editingPrioridad.active}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Activa</span>
                        </label>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPrioridad(null)}
                          className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium bg-white hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-2">
                  {prioridades.map((prioridad) => (
                    <div
                      key={prioridad.id}
                      className={`p-4 border rounded-lg flex justify-between items-center ${
                        !prioridad.active ? 'bg-gray-100 opacity-60' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium">{prioridad.name}</h3>
                          {prioridad.description && (
                            <p className="text-sm text-gray-500">{prioridad.description}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${prioridad.color} text-gray-800`}>
                              {prioridad.name}
                            </span>
                            <span className="text-xs text-gray-500">Nivel: {prioridad.level}</span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                prioridad.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {prioridad.active ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingPrioridad(prioridad);
                            setShowPrioridadForm(false);
                            setPrioridadNivel(prioridad.level.toString());
                            setPrioridadColor(prioridad.color);
                          }}
                          className="group p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center"
                          title="Editar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setPrioridadToDelete(prioridad)}
                          className="group p-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center"
                          title="Eliminar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'direcciones' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Direcciones</h2>
                  <button
                    onClick={() => {
                      setShowDireccionForm(true);
                      setEditingDireccion(null);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Nueva Dirección
                  </button>
                </div>

                <div className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
                    <div className="min-w-0">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <svg
                          className="w-4 h-4 text-blue-600"
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
                          value={direccionesSearchTerm}
                          onChange={(e) => {
                            const value = e.target.value;
                            setDireccionesSearchTerm(value);
                            if (value === '') {
                              setDireccionesSearch(undefined);
                              setDireccionesPage(1);
                            }
                          }}
                          onKeyPress={(e) => e.key === 'Enter' && handleDireccionesSearch()}
                          placeholder="Nombre o descripción..."
                          className="flex-1 min-w-0 px-4 py-2.5 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                        />
                        <button
                          onClick={handleDireccionesSearch}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-r-lg hover:from-blue-700 hover:to-blue-800 flex-shrink-0 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                        >
                          <svg
                            className="w-5 h-5"
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
                        </button>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <svg
                          className="w-4 h-4 text-purple-600"
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
                        <span>Dirección</span>
                      </label>
                      <div className="relative">
                        <select
                          value={direccionesOrderDirection}
                          onChange={(e) => {
                            setDireccionesOrderDirection(e.target.value as 'ASC' | 'DESC');
                            setDireccionesPage(1);
                          }}
                          className="w-full min-w-0 px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md appearance-none cursor-pointer"
                        >
                          <option value="ASC">Ascendente</option>
                          <option value="DESC">Descendente</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {(direccionesSearch || direccionesSearchTerm) && (
                      <div className="min-w-0 flex items-end">
                        <button
                          onClick={handleClearDireccionesSearch}
                          className="w-full px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          Limpiar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {showDireccionForm && !editingDireccion && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Crear Dirección</h3>
                    <form onSubmit={handleCreateDireccion} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Crear
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDireccionForm(false)}
                          className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {editingDireccion && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Editar Dirección</h3>
                    <form onSubmit={handleUpdateDireccion} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={editingDireccion.name}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          defaultValue={editingDireccion.description || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="active"
                          defaultChecked={editingDireccion.active}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">Activo</label>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Actualizar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDireccion(null)}
                          className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-3">
                  {direcciones.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {loadingDirecciones ? 'Cargando...' : 'No se encontraron direcciones'}
                    </div>
                  ) : (
                    direcciones.map((direccion) => (
                      <div
                        key={direccion.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{direccion.name}</h3>
                            {direccion.description && (
                              <p className="text-sm text-gray-600 mt-1">{direccion.description}</p>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${
                                  direccion.active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {direccion.active ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingDireccion(direccion);
                                setShowDireccionForm(false);
                              }}
                              className="group p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center"
                              title="Editar"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDireccionToDelete(direccion)}
                              className="group p-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center"
                              title="Eliminar"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {direccionesPagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Mostrando {((direccionesPagination.page - 1) * direccionesPagination.limit) + 1} a{' '}
                      {Math.min(direccionesPagination.page * direccionesPagination.limit, direccionesPagination.total)} de{' '}
                      {direccionesPagination.total} direcciones
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDireccionesPage((prev) => Math.max(1, prev - 1))}
                        disabled={direccionesPagination.page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Anterior
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: direccionesPagination.totalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            const current = direccionesPagination.page;
                            const total = direccionesPagination.totalPages;
                            return (
                              page === 1 ||
                              page === total ||
                              (page >= current - 1 && page <= current + 1)
                            );
                          })
                          .map((page, index, array) => {
                            const prevPage = array[index - 1];
                            const showEllipsis = prevPage && page - prevPage > 1;
                            return (
                              <React.Fragment key={page}>
                                {showEllipsis && (
                                  <span className="px-2 text-gray-500">...</span>
                                )}
                                <button
                                  onClick={() => setDireccionesPage(page)}
                                  className={`px-4 py-2 border rounded-lg font-medium transition-all duration-200 ${
                                    direccionesPagination.page === page
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            );
                          })}
                      </div>
                      <button
                        onClick={() => setDireccionesPage((prev) => Math.min(direccionesPagination.totalPages, prev + 1))}
                        disabled={direccionesPagination.page === direccionesPagination.totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'equipment-types' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Tipos de Equipos</h2>
                  <button
                    onClick={() => {
                      setShowEquipmentTypeForm(true);
                      setEditingEquipmentType(null);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Nuevo Tipo de Equipo
                  </button>
                </div>

                {showEquipmentTypeForm && !editingEquipmentType && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Crear Tipo de Equipo</h3>
                    <form onSubmit={handleCreateEquipmentType} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Crear
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEquipmentTypeForm(false)}
                          className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium bg-white hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {editingEquipmentType && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Editar Tipo de Equipo</h3>
                    <form onSubmit={handleUpdateEquipmentType} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={editingEquipmentType.name}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          name="description"
                          defaultValue={editingEquipmentType.description || ''}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="active"
                            defaultChecked={editingEquipmentType.active}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Activo</span>
                        </label>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingEquipmentType(null)}
                          className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium bg-white hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-2">
                  {equipmentTypes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {loadingEquipmentTypes ? 'Cargando...' : 'No se encontraron tipos de equipos'}
                    </div>
                  ) : (
                    equipmentTypes.map((equipmentType) => (
                      <div
                        key={equipmentType.id}
                        className={`p-4 border rounded-lg flex justify-between items-center ${
                          !equipmentType.active ? 'bg-gray-100 opacity-60' : 'bg-white'
                        }`}
                      >
                        <div>
                          <h3 className="font-medium">{equipmentType.name}</h3>
                          {equipmentType.description && (
                            <p className="text-sm text-gray-500">{equipmentType.description}</p>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              equipmentType.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {equipmentType.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingEquipmentType(equipmentType);
                              setShowEquipmentTypeForm(false);
                            }}
                            className="group p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center"
                            title="Editar"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEquipmentTypeToDelete(equipmentType)}
                            className="group p-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center"
                            title="Eliminar"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'consumable-types' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Tipos de Consumibles</h2>
                  <button
                    onClick={() => {
                      setShowConsumableTypeForm(true);
                      setEditingConsumableType(null);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Nuevo Tipo de Consumible
                  </button>
                </div>

                {showConsumableTypeForm && !editingConsumableType && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Crear Tipo de Consumible</h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const name = formData.get('name') as string;
                        const description = formData.get('description') as string;

                        createConsumableTypeMutation.mutate(
                          { name, description },
                          {
                            onSuccess: () => {
                              setShowConsumableTypeForm(false);
                            },
                          }
                        );
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Crear
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowConsumableTypeForm(false)}
                          className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium bg-white hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {editingConsumableType && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Editar Tipo de Consumible</h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!editingConsumableType) return;

                        const formData = new FormData(e.currentTarget);
                        const name = formData.get('name') as string;
                        const description = formData.get('description') as string;
                        const active = formData.get('active') === 'on';

                        updateConsumableTypeMutation.mutate(
                          {
                            id: editingConsumableType.id,
                            data: { name, description, active },
                          },
                          {
                            onSuccess: () => {
                              setEditingConsumableType(null);
                            },
                          }
                        );
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={editingConsumableType.name}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          name="description"
                          defaultValue={editingConsumableType.description || ''}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="active"
                            defaultChecked={editingConsumableType.active}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Activo</span>
                        </label>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingConsumableType(null)}
                          className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium bg-white hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-2">
                  {consumableTypes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {loadingConsumableTypes ? 'Cargando...' : 'No se encontraron tipos de consumibles'}
                    </div>
                  ) : (
                    consumableTypes.map((consumableType) => (
                      <div
                        key={consumableType.id}
                        className={`p-4 border rounded-lg flex justify-between items-center ${
                          !consumableType.active ? 'bg-gray-100 opacity-60' : 'bg-white'
                        }`}
                      >
                        <div>
                          <h3 className="font-medium">{consumableType.name}</h3>
                          {consumableType.description && (
                            <p className="text-sm text-gray-500">{consumableType.description}</p>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              consumableType.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {consumableType.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingConsumableType(consumableType);
                              setShowConsumableTypeForm(false);
                            }}
                            className="group p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center"
                            title="Editar"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 transition-all duration-200.ease-in-out group-hover:scale-110 group-hover:rotate-12"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => setConsumableTypeToDelete(consumableType)}
                            className="group p-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center"
                            title="Eliminar"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {categoriaToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar eliminación</h3>
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que deseas eliminar {categoriaToDelete.name}?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCategoriaToDelete(null)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 ease-in-out"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCategoria}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {prioridadToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar eliminación</h3>
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que deseas eliminar la prioridad {prioridadToDelete.name}?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setPrioridadToDelete(null)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 ease-in-out"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeletePrioridad}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {direccionToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar eliminación</h3>
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que deseas eliminar la dirección {direccionToDelete.name}?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setDireccionToDelete(null)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 ease-in-out"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteDireccion}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {equipmentTypeToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar eliminación</h3>
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que deseas eliminar el tipo de equipo {equipmentTypeToDelete.name}?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEquipmentTypeToDelete(null)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 ease-in-out"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteEquipmentType}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {consumableTypeToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex.items-center justify-center z-[100]">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar eliminación</h3>
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que deseas eliminar el tipo de consumible {consumableTypeToDelete.name}?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setConsumableTypeToDelete(null)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 ease-in-out"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!consumableTypeToDelete) return;
                    deleteConsumableTypeMutation.mutate(consumableTypeToDelete.id, {
                      onSuccess: () => {
                        setConsumableTypeToDelete(null);
                      },
                    });
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95 transition-all.duration-200.ease-in-out"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      </PageWrapper>
    </>
  );
};
