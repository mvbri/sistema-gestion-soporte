import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import {
  useEquipmentById,
  useEquipmentTypes,
  useEquipmentStatuses,
  useUpdateEquipment,
  useAssignEquipment,
  useUnassignEquipment,
} from '../hooks/useEquipment';
import { useTecnicos } from '../hooks/useTickets';
import { updateEquipmentSchema, type UpdateEquipmentData, type AssignEquipmentData } from '../schemas/equipmentSchemas';
import { StatusBadge } from '../components/equipment/StatusBadge';
import { TypeBadge } from '../components/equipment/TypeBadge';
import { AssignEquipmentModal } from '../components/equipment/AssignEquipmentModal';
import { ConfirmUnassignModal } from '../components/equipment/ConfirmUnassignModal';

export const EquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [hasWarranty, setHasWarranty] = useState(false);

  const equipmentId = id ? parseInt(id) : undefined;
  const { data: equipment, isLoading: loadingEquipment } = useEquipmentById(equipmentId);
  const { data: types = [] } = useEquipmentTypes();
  const { data: statuses = [] } = useEquipmentStatuses();
  const { data: tecnicos = [] } = useTecnicos();

  const updateEquipmentMutation = useUpdateEquipment();
  const assignEquipmentMutation = useAssignEquipment();
  const unassignEquipmentMutation = useUnassignEquipment();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<UpdateEquipmentData>({
    resolver: zodResolver(updateEquipmentSchema),
  });

  const formatDateForInput = (date: string | null | undefined): string => {
    if (!date) return '';
    // Si ya viene en formato YYYY-MM-DD lo dejamos tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (equipment) {
      const hasWarrantyValue = !!equipment.warranty_expires_at;
      setHasWarranty(hasWarrantyValue);
      reset({
        name: equipment.name,
        brand: equipment.brand,
        model: equipment.model,
        serial_number: equipment.serial_number,
        type_id: equipment.type_id,
        status: equipment.status,
        assigned_to_user_id: equipment.assigned_to_user_id,
        description: equipment.description,
        purchase_date: formatDateForInput(equipment.purchase_date),
        warranty_expires_at: formatDateForInput(equipment.warranty_expires_at),
      });
    }
  }, [equipment, reset]);

  const onSubmit = (data: UpdateEquipmentData) => {
    if (!equipmentId) return;
    updateEquipmentMutation.mutate(
      { id: equipmentId, data },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleAssign = (data: AssignEquipmentData) => {
    if (!equipmentId) return;
    assignEquipmentMutation.mutate(
      { id: equipmentId, data },
      {
        onSuccess: () => {
          setShowAssignModal(false);
        },
      }
    );
  };

  const handleUnassign = () => {
    setShowUnassignModal(true);
  };

  const confirmUnassign = () => {
    if (!equipmentId) return;
    unassignEquipmentMutation.mutate(equipmentId, {
      onSuccess: () => {
        setShowUnassignModal(false);
      },
    });
  };

  const canEdit = user?.role === 'administrator';

  if (loadingEquipment) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600 text-lg font-medium">Cargando equipo...</p>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  if (!equipment) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-gray-700 text-xl font-semibold mb-2">Equipo no encontrado</p>
            <p className="text-gray-500 mb-6">El equipo que buscas no existe o ha sido eliminado.</p>
            <button
              onClick={() => navigate('/equipment')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              Volver a la lista
            </button>
          </div>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-6xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg mb-6 p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{equipment.name}</h1>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <StatusBadge status={equipment.status} />
                  {equipment.type_name && <TypeBadge type={equipment.type_name} />}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                {canEdit && !isEditing && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium shadow-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    {equipment.status === 'assigned' && equipment.assigned_to_user_id && (
                      <button
                        onClick={handleUnassign}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all font-medium shadow-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Desasignar
                      </button>
                    )}
                    {equipment.status !== 'assigned' && (
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium shadow-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Asignar
                      </button>
                    )}
                  </>
                )}
                {isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      reset();
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all font-medium shadow-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancelar
                  </button>
                )}
                <button
                  onClick={() => navigate('/equipment')}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all font-medium shadow-sm flex items-center gap-2 backdrop-blur-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">

              {!isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {equipment.brand && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Marca</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{equipment.brand}</p>
                      </div>
                    )}
                    {equipment.model && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Modelo</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{equipment.model}</p>
                      </div>
                    )}
                    {equipment.serial_number && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Número de Serie</span>
                        </div>
                        <p className="text-base font-mono font-bold text-gray-900">{equipment.serial_number}</p>
                      </div>
                    )}
                    {equipment.location && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Ubicación</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{equipment.location}</p>
                      </div>
                    )}
                    {equipment.assigned_to_user_name && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Asignado a</span>
                        </div>
                        <p className="text-lg font-bold text-blue-900">{equipment.assigned_to_user_name}</p>
                      </div>
                    )}
                    {equipment.purchase_date && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Fecha de Compra</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {new Date(equipment.purchase_date).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}
                    {equipment.warranty_expires_at && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="text-sm font-semibold text-green-700 uppercase tracking-wide">Garantía Expira</span>
                        </div>
                        <p className="text-lg font-bold text-green-900">
                          {new Date(equipment.warranty_expires_at).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {equipment.description && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Descripción</span>
                      </div>
                      <p className="text-gray-900 leading-relaxed">{equipment.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600 font-medium">{errors.name.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Marca</label>
                      <input 
                        type="text" 
                        {...register('brand')} 
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Modelo</label>
                      <input 
                        type="text" 
                        {...register('model')} 
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Serie</label>
                    <input 
                      type="text" 
                      {...register('serial_number')} 
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
                      <Controller
                        name="type_id"
                        control={control}
                        render={({ field }) => (
                          <select 
                            {...field} 
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                          >
                            <option value="">Seleccione un tipo</option>
                            {types.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <select 
                            {...field} 
                            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                          >
                            {statuses.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Compra</label>
                      <input 
                        type="date" 
                        {...register('purchase_date')} 
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                      />
                      <div className="mt-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="hasWarranty"
                            checked={hasWarranty}
                            onChange={(e) => {
                              setHasWarranty(e.target.checked);
                              if (!e.target.checked) {
                                setValue('warranty_expires_at', '');
                              }
                            }}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer transition-all duration-200"
                          />
                          <label 
                            htmlFor="hasWarranty" 
                            className="ml-3 text-sm font-semibold text-gray-700 cursor-pointer select-none hover:text-gray-900 transition-colors duration-200"
                          >
                            Si aplica garantía
                          </label>
                        </div>
                      </div>
                      {hasWarranty && (
                        <div className="mt-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Garantía Expira</label>
                          <input 
                            type="date" 
                            {...register('warranty_expires_at')} 
                            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                    <textarea 
                      {...register('description')} 
                      rows={4} 
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none" 
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={updateEquipmentMutation.isPending}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg flex items-center gap-2"
                    >
                      {updateEquipmentMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Guardar Cambios
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </PageWrapper>

      <AssignEquipmentModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssign}
        users={tecnicos}
        equipmentName={equipment.name}
        isLoading={assignEquipmentMutation.isPending}
      />

      <ConfirmUnassignModal
        isOpen={showUnassignModal}
        onClose={() => setShowUnassignModal(false)}
        onConfirm={confirmUnassign}
        equipmentName={equipment.name}
      />
    </>
  );
};
