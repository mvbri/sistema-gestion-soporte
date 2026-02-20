import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import {
  useAdminCategorias,
  useAdminPrioridades,
  useCreateCategoria,
  useUpdateCategoria,
  useDeleteCategoria,
  useCreatePrioridad,
  useUpdatePrioridad,
  useDeletePrioridad,
} from '../hooks/useAdmin';
import type { CategoriaTicket, PrioridadTicket } from '../types';

export const AdminConfig: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'categorias' | 'prioridades'>('categorias');
  const [editingCategoria, setEditingCategoria] = useState<CategoriaTicket | null>(null);
  const [editingPrioridad, setEditingPrioridad] = useState<PrioridadTicket | null>(null);
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const [showPrioridadForm, setShowPrioridadForm] = useState(false);
  const [prioridadNivel, setPrioridadNivel] = useState<string>('');
  const [prioridadColor, setPrioridadColor] = useState<string>('');
  const [categoriaToDelete, setCategoriaToDelete] = useState<CategoriaTicket | null>(null);
  const [prioridadToDelete, setPrioridadToDelete] = useState<PrioridadTicket | null>(null);

  const { data: categorias = [], isLoading: loadingCategorias } = useAdminCategorias();
  const { data: prioridades = [], isLoading: loadingPrioridades } = useAdminPrioridades();
  const createCategoriaMutation = useCreateCategoria();
  const updateCategoriaMutation = useUpdateCategoria();
  const deleteCategoriaMutation = useDeleteCategoria();
  const createPrioridadMutation = useCreatePrioridad();
  const updatePrioridadMutation = useUpdatePrioridad();
  const deletePrioridadMutation = useDeletePrioridad();

  const loading = loadingCategorias || loadingPrioridades;

  useEffect(() => {
    if (user?.role !== 'administrator') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleCreateCategoria = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nombre = formData.get('nombre') as string;
    const descripcion = formData.get('descripcion') as string;

    createCategoriaMutation.mutate(
      { nombre, descripcion },
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
    const nombre = formData.get('nombre') as string;
    const descripcion = formData.get('descripcion') as string;
    const activo = formData.get('activo') === 'on';

    updateCategoriaMutation.mutate(
      {
        id: editingCategoria.id,
        data: { nombre, descripcion, activo },
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
    const nombre = formData.get('nombre') as string;
    const nivel = parseInt(formData.get('nivel') as string);
    const color = prioridadColor || getColorByNivel(nivel.toString());
    const descripcion = formData.get('descripcion') as string;

    createPrioridadMutation.mutate(
      { nombre, nivel, color, descripcion },
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
    const nombre = formData.get('nombre') as string;
    const nivel = parseInt(formData.get('nivel') as string);
    const color = prioridadColor || getColorByNivel(nivel.toString());
    const descripcion = formData.get('descripcion') as string;
    const activo = formData.get('activo') === 'on';

    updatePrioridadMutation.mutate(
      {
        id: editingPrioridad.id,
        data: { nombre, nivel, color, descripcion, activo },
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
          <p className="text-gray-600 mt-2">Gestiona categorías y prioridades del sistema</p>
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
                          name="nombre"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          name="descripcion"
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
                          name="nombre"
                          defaultValue={editingCategoria.nombre}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          name="descripcion"
                          defaultValue={editingCategoria.descripcion || ''}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="activo"
                            defaultChecked={editingCategoria.activo}
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
                        !categoria.activo ? 'bg-gray-100 opacity-60' : 'bg-white'
                      }`}
                    >
                      <div>
                        <h3 className="font-medium">{categoria.nombre}</h3>
                        {categoria.descripcion && (
                          <p className="text-sm text-gray-500">{categoria.descripcion}</p>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            categoria.activo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {categoria.activo ? 'Activa' : 'Inactiva'}
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
                          name="nombre"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nivel (orden numérico) <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="nivel"
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
                          name="descripcion"
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
                          name="nombre"
                          defaultValue={editingPrioridad.nombre}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nivel (orden numérico) <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="nivel"
                          defaultValue={editingPrioridad.nivel.toString()}
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
                          name="descripcion"
                          defaultValue={editingPrioridad.descripcion || ''}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="activo"
                            defaultChecked={editingPrioridad.activo}
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
                        !prioridad.activo ? 'bg-gray-100 opacity-60' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium">{prioridad.nombre}</h3>
                          {prioridad.descripcion && (
                            <p className="text-sm text-gray-500">{prioridad.descripcion}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${prioridad.color} text-gray-800`}>
                              {prioridad.nombre}
                            </span>
                            <span className="text-xs text-gray-500">Nivel: {prioridad.nivel}</span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                prioridad.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {prioridad.activo ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingPrioridad(prioridad);
                            setShowPrioridadForm(false);
                            setPrioridadNivel(prioridad.nivel.toString());
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
          </div>
        </div>

        {categoriaToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar eliminación</h3>
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que deseas eliminar {categoriaToDelete.nombre}?
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
                ¿Estás seguro de que deseas eliminar la prioridad {prioridadToDelete.nombre}?
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
        </div>
      </div>
      </PageWrapper>
    </>
  );
};
