import { Link } from 'react-router-dom';

export const EmailAlreadyVerified: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email ya verificado</h2>
        <p className="text-gray-600 mb-6">
          Tu email ya está verificado. Puedes iniciar sesión en la aplicación.
        </p>
        <div className="space-y-3">
          <Link
            to="/login"
            className="block w-full btn-primary text-center"
          >
            Ir al Login
          </Link>
          <Link
            to="/dashboard"
            className="block w-full text-primary-600 hover:text-primary-700 font-medium"
          >
            Ir a la aplicación
          </Link>
        </div>
      </div>
    </div>
  );
};

