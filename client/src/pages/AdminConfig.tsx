import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { adminService } from '../services/adminService';
import type { CategoriaTicket, PrioridadTicket } from '../types';
import { toast } from 'react-toastify';

export const AdminConfig: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<CategoriaTicket[]>([]);
  const [prioridades, setPrioridades] = useState<PrioridadTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'categorias' | 'prioridades'>('categorias');
  const [editingCategoria, setEditingCategoria] = useState<CategoriaTicket | null>(null);
  const [editingPrioridad, setEditingPrioridad] = useState<PrioridadTicket | null>(null);
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const [showPrioridadForm, setShowPrioridadForm] = useState(false);
  const [prioridadNivel, setPrioridadNivel] = useState<string>('');
  const [prioridadColor, setPrioridadColor] = useState<string>('');
  const [categoriaToDelete, setCategoriaToDelete] = useState<CategoriaTicket | null>(null);
  const [prioridadToDelete, setPrioridadToDelete] = useState<PrioridadTicket | null>(null);

  useEffect(() => {
    if (user?.role !== 'administrator') {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriasRes, prioridadesRes] = await Promise.all([
        adminService.getCategorias(),
        adminService.getPrioridades(),
      ]);

      if (categoriasRes.success && categoriasRes.data) setCategorias(categoriasRes.data);
      if (prioridadesRes.success && prioridadesRes.data) setPrioridades(prioridadesRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategoria = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nombre = formData.get('nombre') as string;
    const descripcion = formData.get('descripcion') as string;

    try {
      const response = await adminService.createCategoria({ nombre, descripcion });
      if (response.success) {
        toast.success('Categoría creada exitosamente');
        setShowCategoriaForm(false);
        loadData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear categoría');
    }
  };

  const handleUpdateCategoria = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategoria) return;

    const formData = new FormData(e.currentTarget);
    const nombre = formData.get('nombre') as string;
    const descripcion = formData.get('descripcion') as string;
    const activo = formData.get('activo') === 'on';

    try {
      const response = await adminService.updateCategoria(editingCategoria.id, {
        nombre,
        descripcion,
        activo,
      });
      if (response.success) {
        toast.success('Categoría actualizada exitosamente');
        setEditingCategoria(null);
        loadData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar categoría');
    }
  };

  const handleDeleteCategoria = async () => {
    if (!categoriaToDelete) return;

    try {
      const response = await adminService.deleteCategoria(categoriaToDelete.id);
      if (response.success) {
        toast.success('Categoría eliminada exitosamente');
        setCategoriaToDelete(null);
        loadData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar categoría');
    }
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

  const handleCreatePrioridad = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nombre = formData.get('nombre') as string;
    const nivel = parseInt(formData.get('nivel') as string);
    const color = prioridadColor || getColorByNivel(nivel.toString());
    const descripcion = formData.get('descripcion') as string;

    try {
      const response = await adminService.createPrioridad({ nombre, nivel, color, descripcion });
      if (response.success) {
        toast.success('Prioridad creada exitosamente');
        setShowPrioridadForm(false);
        setPrioridadNivel('');
        setPrioridadColor('');
        loadData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear prioridad');
    }
  };

  const handleUpdatePrioridad = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPrioridad) return;

    const formData = new FormData(e.currentTarget);
    const nombre = formData.get('nombre') as string;
    const nivel = parseInt(formData.get('nivel') as string);
    const color = prioridadColor || getColorByNivel(nivel.toString());
    const descripcion = formData.get('descripcion') as string;
    const activo = formData.get('activo') === 'on';

    try {
      const response = await adminService.updatePrioridad(editingPrioridad.id, {
        nombre,
        nivel,
        color,
        descripcion,
        activo,
      });
      if (response.success) {
        toast.success('Prioridad actualizada exitosamente');
        setEditingPrioridad(null);
        setPrioridadNivel('');
        setPrioridadColor('');
        loadData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar prioridad');
    }
  };

  const handleDeletePrioridad = async () => {
    if (!prioridadToDelete) return;

    try {
      const response = await adminService.deletePrioridad(prioridadToDelete.id);
      if (response.success) {
        toast.success('Prioridad eliminada exitosamente');
        setPrioridadToDelete(null);
        loadData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar prioridad');
    }
  };

  if (user?.role !== 'administrator') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
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
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'categorias'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Categorías
              </button>
              <button
                onClick={() => setActiveTab('prioridades')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'prioridades'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
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
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Crear
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCategoriaForm(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md"
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
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCategoria(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md"
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
                          className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setCategoriaToDelete(categoria)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Eliminar
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
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
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Crear
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPrioridadForm(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md"
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
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPrioridad(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md"
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
                          className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setPrioridadToDelete(prioridad)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Eliminar
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
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar eliminación</h3>
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que deseas eliminar {categoriaToDelete.nombre}?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCategoriaToDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCategoria}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {prioridadToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar eliminación</h3>
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que deseas eliminar la prioridad {prioridadToDelete.nombre}?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setPrioridadToDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeletePrioridad}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
