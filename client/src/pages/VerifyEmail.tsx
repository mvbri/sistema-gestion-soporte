import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setLoading(false);
        toast.error('Token de verificación no encontrado');
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        
        if (response.success) {
          if (response.data && typeof response.data === 'object' && 'already_verified' in response.data && response.data.already_verified) {
            navigate('/email-ya-verificado');
            return;
          }
          setStatus('success');
          toast.success('Email verificado exitosamente');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setStatus('error');
          toast.error(response.message || 'Error al verificar email');
        }
      } catch (err: unknown) {
        setStatus('error');
        let errorMessage = 'Error al verificar email';
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data?: { message?: string } } };
          errorMessage = axiosError.response?.data?.message || errorMessage;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {loading && status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificando email...</h2>
            <p className="text-gray-600">Por favor espera mientras verificamos tu email.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Email verificado!</h2>
            <p className="text-gray-600">Tu email ha sido verificado exitosamente. Redirigiendo al login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al verificar</h2>
            <p className="text-gray-600 mb-4">No se pudo verificar tu email. El token puede haber expirado o ser inválido.</p>
            <a
              href="/solicitar-verificacion"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Solicitar nuevo enlace de verificación
            </a>
          </>
        )}
      </div>
    </div>
  );
};

