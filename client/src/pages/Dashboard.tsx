// Página de Dashboard (protegida)
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { UserProfileIcon } from '../components/icons/UserProfileIcon';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Sistema de Gestión de Soporte Técnico
              </h1>
            </div>
            <div className="flex items-center" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserProfileIcon className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.full_name}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-4 top-16 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.full_name}
                    </p>
                    {user?.role === 'administrator' && (
                      <span className="mt-1 inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                        Administrador
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/perfil');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Actualizar información
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Bienvenido, {user?.full_name}
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Email:</p>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              {user?.phone && (
                <div>
                  <p className="text-sm text-gray-600">Teléfono:</p>
                  <p className="text-gray-900">{user.phone}</p>
                </div>
              )}
              {user?.department && (
                <div>
                  <p className="text-sm text-gray-600">Departamento:</p>
                  <p className="text-gray-900">{user.department}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Rol:</p>
                <p className="text-gray-900 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/tickets')}
                className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <h3 className="font-bold text-lg mb-2">Ver Tickets</h3>
                <p className="text-sm">Gestiona y visualiza todos los tickets</p>
              </button>
              {user?.role === 'end_user' && (
                <button
                  onClick={() => navigate('/tickets/crear')}
                  className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <h3 className="font-bold text-lg mb-2">Crear Ticket</h3>
                  <p className="text-sm">Reporta un nuevo incidente</p>
                </button>
              )}
              {user?.role === 'administrator' && (
                <>
                  <button
                    onClick={() => navigate('/tickets/dashboard')}
                    className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <h3 className="font-bold text-lg mb-2">Dashboard</h3>
                    <p className="text-sm">Estadísticas y métricas del sistema</p>
                  </button>
                  <button
                    onClick={() => navigate('/admin/config')}
                    className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <h3 className="font-bold text-lg mb-2">Configuración</h3>
                    <p className="text-sm">Gestionar categorías y prioridades</p>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

