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
  useRestoreBackupFromFile,
  useDeleteBackup,
} from '../hooks/useBackup';
import { backupService } from '../services/backupService';
import { ConfirmRestoreModal } from '../components/backup/ConfirmRestoreModal';
import { ConfirmDeleteBackupModal } from '../components/backup/ConfirmDeleteBackupModal';
import type { BackupFile } from '../services/backupService';
import { ClearFiltersIcon } from '../components/icons/ClearFiltersIcon';

export const BackupRestore: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBackupFile, setSelectedBackupFile] = useState<BackupFile | null>(null);
  const [selectedBackupToDelete, setSelectedBackupToDelete] = useState<BackupFile | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [orderBy, setOrderBy] = useState<'filename' | 'size' | 'created_at'>('created_at');
  const [orderDirection, setOrderDirection] = useState<'ASC' | 'DESC'>('DESC');
  
  const generateBackupMutation = useGenerateBackup();
  const restoreBackupMutation = useRestoreBackup();
  const restoreBackupFromFileMutation = useRestoreBackupFromFile();
  const deleteBackupMutation = useDeleteBackup();
  
  const { data: backupsData, isLoading: loadingBackups, refetch: refetchBackups } = useListBackups({
    search,
    page,
    limit,
    orderBy,
    orderDirection,
  });
  
  const backups = (backupsData && 'backups' in backupsData ? backupsData.backups : []) || [];
  const pagination = (backupsData && 'pagination' in backupsData ? backupsData.pagination : { page: 1, limit: 10, total: 0, totalPages: 0 }) || { page: 1, limit: 10, total: 0, totalPages: 0 };

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

  const handleDeleteFromList = (backup: BackupFile) => {
    setSelectedBackupToDelete(backup);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedBackupToDelete) return;

    deleteBackupMutation.mutate(selectedBackupToDelete.filename, {
      onSuccess: () => {
        setSelectedBackupToDelete(null);
        setShowDeleteModal(false);
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
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <header className="mb-6">
              <h1 className="page-heading">Respaldo y restauración</h1>
              <p className="page-subheading">Gestiona los respaldos de la base de datos del sistema.</p>
            </header>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Sección: Generar Respaldo */}
            <div className="card relative overflow-hidden before:absolute before:inset-0 before:bg-slate-950/25 before:content-['']">
              <div className="relative z-10 flex items-center mb-4">
                <div className="rounded-2xl bg-sky-500/15 border border-sky-400/25 p-3 mr-4">
                  <svg
                    className="w-6 h-6 text-sky-200"
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
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  Generar Respaldo
                </h2>
              </div>
              <p className="relative z-10 text-sm text-blue-100/80 mb-6">
                Crea un respaldo completo de la base de datos. El archivo se descargará automáticamente.
              </p>
              <button
                onClick={handleGenerateBackup}
                disabled={generateBackupMutation.isPending}
                className="relative z-10 btn-primary w-full"
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
            <div className="card relative overflow-hidden before:absolute before:inset-0 before:bg-slate-950/25 before:content-['']">
              <div className="relative z-10 flex items-center mb-4">
                <div className="rounded-2xl bg-emerald-500/15 border border-emerald-400/25 p-3 mr-4">
                  <svg
                    className="w-6 h-6 text-emerald-200"
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
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  Restaurar desde archivo
                </h2>
              </div>
              <p className="relative z-10 text-sm text-blue-100/80 mb-4">
                Restaura la base de datos desde un archivo de respaldo .sql.
              </p>
              
              {/* Advertencia mejorada */}
              <div className="relative z-10 mb-6 rounded-2xl border border-amber-400/35 bg-amber-500/10 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-amber-200"
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
                    <h3 className="text-sm font-semibold text-amber-100 mb-2">
                      Advertencia importante
                    </h3>
                    <div className="text-xs sm:text-sm text-amber-100/80 space-y-1.5">
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

              <form onSubmit={handleRestoreBackup} className="relative z-10">
                <div className="mb-4">
                  <label
                    htmlFor="backupFile"
                    className="label-field"
                  >
                    Seleccionar archivo de respaldo (.sql)
                  </label>
                  <input
                    type="file"
                    id="backupFile"
                    accept=".sql"
                    onChange={handleFileChange}
                    className="input-field w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-800/80 file:text-slate-100 file:shadow-sm hover:file:bg-slate-700/90 cursor-pointer"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-xs sm:text-sm text-blue-100/80">
                      Archivo seleccionado: <span className="font-semibold text-white">{selectedFile.name}</span>
                      <br />
                      <span className="text-blue-100/60">
                        Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!selectedFile || restoreBackupMutation.isPending}
                  className="btn-danger w-full disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-violet-500/15 border border-violet-400/25 p-3">
                  <svg
                    className="w-6 h-6 text-violet-200"
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
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Respaldos disponibles</h2>
                  <p className="text-xs text-blue-100/70">Busca, ordena y descarga/restaura desde la lista.</p>
                </div>
              </div>
              <button
                onClick={() => refetchBackups()}
                className="btn-secondary w-full sm:w-auto"
              >
                Actualizar
              </button>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="mb-6 space-y-4">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 min-w-0">
                  <label className="label-field flex items-center gap-2 !mb-2">
                    <svg className="w-4 h-4 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Buscar</span>
                  </label>
                  <div className="flex min-w-0 shadow-sm">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre de archivo..."
                    className="input-field flex-1 min-w-0 rounded-l-xl rounded-r-none border-r-0"
                  />
                  <button type="submit" className="btn-primary px-5 py-2.5 rounded-l-none rounded-r-xl flex-shrink-0">
                    Buscar
                  </button>
                  </div>
                </div>

                {(search || orderBy !== 'created_at' || orderDirection !== 'DESC') && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <ClearFiltersIcon className="w-5 h-5" />
                    Limpiar
                  </button>
                )}
              </form>

              {/* Ordenamiento */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                <span className="text-blue-100/70 font-medium">Ordenar por:</span>
                <div className="flex flex-wrap gap-2">
                  {(['filename', 'size', 'created_at'] as const).map((field) => (
                    <button
                      key={field}
                      onClick={() => handleSort(field)}
                      className={`btn-secondary px-3 py-1.5 rounded-lg text-xs sm:text-sm ${
                        orderBy === field ? 'border-sky-300/60' : 'border-sky-400/25'
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
              <div className="py-10 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sky-400 border-t-transparent" />
                <p className="mt-3 text-blue-100/85">Cargando respaldos…</p>
              </div>
            ) : backups.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-blue-100/80">
                  {search ? 'No se encontraron respaldos con ese criterio de búsqueda.' : 'No hay respaldos disponibles.'}
                </p>
              </div>
            ) : (
              <>
                <div className="card !p-0 overflow-hidden">
                  <div className="tickets-list-light overflow-x-auto bg-white/95">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Archivo
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Tamaño
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Fecha de Creación
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {backups.map((backup) => {
                        const backupFile: { filename: string; size: number; created_at: string; modified_at: string } = {
                          filename: backup.filename,
                          size: backup.size,
                          created_at: backup.created_at,
                          modified_at: backup.modified_at || backup.created_at
                        };
                        return (
                        <tr key={backup.filename} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
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
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatFileSize(backup.size)}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(backup.created_at)}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => handleDownloadBackup(backup.filename)}
                                className="text-blue-600 hover:underline font-medium flex items-center"
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
                                onClick={() => handleRestoreFromList(backupFile)}
                                disabled={restoreBackupFromFileMutation.isPending || deleteBackupMutation.isPending}
                                className="text-emerald-700 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                              <button
                                onClick={() => handleDeleteFromList(backupFile)}
                                disabled={deleteBackupMutation.isPending || restoreBackupFromFileMutation.isPending}
                                className="text-red-600 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                title="Eliminar respaldo"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                </div>

                {/* Paginación */}
                {pagination.totalPages > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs sm:text-sm text-blue-50/90">
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
                        className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className={`btn-secondary px-3 py-1.5 text-xs sm:text-sm ${page === p ? 'border-sky-300/60' : ''}`}
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
                                className={`btn-secondary px-3 py-1.5 text-xs sm:text-sm ${page === p ? 'border-sky-300/60' : ''}`}
                              >
                                {p}
                              </button>
                            );
                          })}
                      </div>
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === pagination.totalPages}
                        className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
      <ConfirmDeleteBackupModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBackupToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        fileName={selectedBackupToDelete?.filename}
        isLoading={deleteBackupMutation.isPending}
      />
    </>
  );
};
