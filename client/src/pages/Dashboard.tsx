// Página de Dashboard (protegida)
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.full_name}
              </span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Cerrar Sesión
              </button>
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

