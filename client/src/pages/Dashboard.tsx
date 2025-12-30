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
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Esta es la Fase 1 del sistema: Autenticación y Registro.
                Los módulos adicionales se implementarán en las siguientes fases.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

