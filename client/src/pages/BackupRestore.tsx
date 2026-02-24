import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { 
  useGenerateBackup, 
  useRestoreBackup, 
  useListBackups,
  useRestoreBackupFromFile 
} from '../hooks/useBackup';
import { backupService } from '../services/backupService';
import { ConfirmRestoreModal } from '../components/backup/ConfirmRestoreModal';
import type { BackupFile } from '../services/backupService';

export const BackupRestore: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackupFile, setSelectedBackupFile] = useState<BackupFile | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [orderBy, setOrderBy] = useState<'filename' | 'size' | 'created_at'>('created_at');
  const [orderDirection, setOrderDirection] = useState<'ASC' | 'DESC'>('DESC');
  
  const generateBackupMutation = useGenerateBackup();
  const restoreBackupMutation = useRestoreBackup();
  const restoreBackupFromFileMutation = useRestoreBackupFromFile();
  
  const { data: backupsData, isLoading: loadingBackups, refetch: refetchBackups } = useListBackups({
    search,
    page,
    limit,
    orderBy,
    orderDirection,
  });
  
  const backups = backupsData?.backups || [];
  const pagination = backupsData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };

  useEffect(() => {
    if (user?.role !== 'administrator') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGenerateBackup = () => {
    generateBackupMutation.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.sql')) {
        toast.error('Por favor selecciona un archivo .sql');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRestoreBackup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Por favor selecciona un archivo de respaldo');
      return;
    }

    setShowRestoreModal(true);
  };

  const handleConfirmRestore = () => {
    if (!selectedFile) return;

    restoreBackupMutation.mutate(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
        setShowRestoreModal(false);
        const fileInput = document.getElementById('backupFile') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      },
    });
  };

  const handleRestoreFromList = (backup: BackupFile) => {
    setSelectedBackupFile(backup);
    setShowRestoreModal(true);
  };

  const handleConfirmRestoreFromList = () => {
    if (!selectedBackupFile) return;

    restoreBackupFromFileMutation.mutate(selectedBackupFile.filename, {
      onSuccess: () => {
        setSelectedBackupFile(null);
        setShowRestoreModal(false);
        refetchBackups();
      },
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearch(searchTerm);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSearch('');
    setPage(1);
    setOrderBy('created_at');
    setOrderDirection('DESC');
  };

  const handleSort = (field: 'filename' | 'size' | 'created_at') => {
    if (orderBy === field) {
      setOrderDirection(orderDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setOrderBy(field);
      setOrderDirection('ASC');
    }
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadBackup = async (filename: string) => {
    try {
      const blob = await backupService.downloadBackup(filename);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Respaldo descargado exitosamente');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al descargar el respaldo';
      toast.error(errorMessage);
    }
  };

  if (user?.role !== 'administrator') {
    return null;
  }

  const isRestoringFromList = selectedBackupFile !== null;
  const currentFileName = isRestoringFromList 
    ? selectedBackupFile?.filename 
    : selectedFile?.name;

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Respaldo y Restauración de Base de Datos
            </h1>
            <p className="text-gray-600">
              Gestiona los respaldos de la base de datos del sistema
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Sección: Generar Respaldo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Generar Respaldo
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                Crea un respaldo completo de la base de datos. El archivo se descargará automáticamente.
              </p>
              <button
                onClick={handleGenerateBackup}
                disabled={generateBackupMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {generateBackupMutation.isPending ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generando respaldo...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Generar Respaldo
                  </>
                )}
              </button>
            </div>

            {/* Sección: Restaurar desde archivo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Restaurar desde archivo
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                Restaura la base de datos desde un archivo de respaldo .sql.
              </p>
              
              {/* Advertencia mejorada */}
              <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-r-lg p-4 shadow-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-amber-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-semibold text-amber-800 mb-2">
                      ⚠️ Advertencia Importante
                    </h3>
                    <div className="text-sm text-amber-700 space-y-1.5">
                      <p className="flex items-start">
                        <span className="font-semibold mr-2">•</span>
                        <span>Esta acción <strong>sobrescribirá todos los datos actuales</strong> de la base de datos.</span>
                      </p>
                      <p className="flex items-start">
                        <span className="font-semibold mr-2">•</span>
                        <span><strong>Recomendación:</strong> Genera un respaldo antes de proceder.</span>
                      </p>
                      <p className="flex items-start">
                        <span className="font-semibold mr-2">•</span>
                        <span>Esta operación <strong>no se puede deshacer</strong>.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRestoreBackup}>
                <div className="mb-4">
                  <label
                    htmlFor="backupFile"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Seleccionar archivo de respaldo (.sql)
                  </label>
                  <input
                    type="file"
                    id="backupFile"
                    accept=".sql"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Archivo seleccionado: <span className="font-medium">{selectedFile.name}</span>
                      <br />
                      <span className="text-gray-500">
                        Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!selectedFile || restoreBackupMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {restoreBackupMutation.isPending ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Restaurando...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Restaurar Base de Datos
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Lista de Respaldos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-full p-3 mr-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Respaldos Disponibles
                </h2>
              </div>
              <button
                onClick={() => refetchBackups()}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Actualizar
              </button>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="mb-6 space-y-4">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre de archivo..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Buscar
                </button>
                {(search || orderBy !== 'created_at' || orderDirection !== 'DESC') && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Limpiar
                  </button>
                )}
              </form>

              {/* Ordenamiento */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600 font-medium">Ordenar por:</span>
                <div className="flex gap-2">
                  {(['filename', 'size', 'created_at'] as const).map((field) => (
                    <button
                      key={field}
                      onClick={() => handleSort(field)}
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                        orderBy === field
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {field === 'filename' && 'Nombre'}
                      {field === 'size' && 'Tamaño'}
                      {field === 'created_at' && 'Fecha'}
                      {orderBy === field && (
                        <svg
                          className={`w-4 h-4 ${orderDirection === 'ASC' ? '' : 'rotate-180'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loadingBackups ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Cargando respaldos...</p>
                </div>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-4 text-gray-500">
                  {search ? 'No se encontraron respaldos con ese criterio de búsqueda' : 'No hay respaldos disponibles'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Archivo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tamaño
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Creación
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {backups.map((backup) => (
                        <tr key={backup.filename} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <svg
                                className="h-5 w-5 text-gray-400 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span className="text-sm font-medium text-gray-900">
                                {backup.filename}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatFileSize(backup.size)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(backup.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => handleDownloadBackup(backup.filename)}
                                className="text-blue-600 hover:text-blue-900 font-medium flex items-center"
                                title="Descargar respaldo"
                              >
                                <svg
                                  className="w-5 h-5 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  />
                                </svg>
                                Descargar
                              </button>
                              <button
                                onClick={() => handleRestoreFromList(backup)}
                                disabled={restoreBackupFromFileMutation.isPending}
                                className="text-green-600 hover:text-green-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                title="Restaurar desde este respaldo"
                              >
                                <svg
                                  className="w-5 h-5 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                  />
                                </svg>
                                Restaurar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {pagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <span>
                        Mostrando <span className="font-medium">{(page - 1) * limit + 1}</span> a{' '}
                        <span className="font-medium">{Math.min(page * limit, pagination.total)}</span> de{' '}
                        <span className="font-medium">{pagination.total}</span> respaldos
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <div className="flex gap-1">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                          .filter((p) => {
                            if (pagination.totalPages <= 7) return true;
                            if (p === 1 || p === pagination.totalPages) return true;
                            if (Math.abs(p - page) <= 1) return true;
                            return false;
                          })
                          .map((p, idx, arr) => {
                            if (idx > 0 && arr[idx - 1] !== p - 1) {
                              return (
                                <React.Fragment key={`ellipsis-${p}`}>
                                  <span className="px-2 py-2 text-gray-500">...</span>
                                  <button
                                    onClick={() => handlePageChange(p)}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                      page === p
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    {p}
                                  </button>
                                </React.Fragment>
                              );
                            }
                            return (
                              <button
                                key={p}
                                onClick={() => handlePageChange(p)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                  page === p
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {p}
                              </button>
                            );
                          })}
                      </div>
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === pagination.totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <ConfirmRestoreModal
        isOpen={showRestoreModal}
        onClose={() => {
          setShowRestoreModal(false);
          setSelectedBackupFile(null);
        }}
        onConfirm={isRestoringFromList ? handleConfirmRestoreFromList : handleConfirmRestore}
        fileName={currentFileName}
        isLoading={restoreBackupMutation.isPending || restoreBackupFromFileMutation.isPending}
      />
    </>
  );
};
