import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Equipment } from '../../types';
import { StatusBadge } from './StatusBadge';
import { TypeBadge } from './TypeBadge';
import { InventoryMetaRow } from '../inventory/InventoryMetaRow';
import { InventoryCardAlert, InventoryCardShell } from '../inventory/InventoryCardShell';

interface EquipmentCardProps {
  equipment: Equipment;
  onDelete?: (id: number, name: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  onDelete,
  canEdit = false,
  canDelete = false,
}) => {
  const navigate = useNavigate();
  const hasActiveLoan = Boolean(equipment.active_loan_id);
  const displayStatus =
    hasActiveLoan && equipment.status === 'available' ? 'assigned' : equipment.status;
  const assignedToName =
    equipment.assigned_to_user_name ||
    (hasActiveLoan ? equipment.active_loan_requester_name : null);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const metaVariant = 'minimal' as const;

  return (
    <InventoryCardShell
      variant="airy"
      title={equipment.name}
      itemLabel="equipo"
      canEdit={canEdit}
      canDelete={canDelete && Boolean(onDelete)}
      onView={canEdit ? () => navigate(`/equipment/${equipment.id}`) : undefined}
      onDelete={onDelete ? () => onDelete(equipment.id, equipment.name) : undefined}
      badges={
        <>
          <StatusBadge status={displayStatus} />
          {equipment.type_name ? <TypeBadge type={equipment.type_name} /> : null}
        </>
      }
    >
      {hasActiveLoan && (
        <InventoryCardAlert
          label="En préstamo"
          value={equipment.active_loan_requester_name || 'Reservado'}
          variant="soft"
        />
      )}
      {equipment.brand ? (
        <InventoryMetaRow variant={metaVariant} label="Marca" value={equipment.brand} />
      ) : null}
      {equipment.model ? (
        <InventoryMetaRow variant={metaVariant} label="Modelo" value={equipment.model} />
      ) : null}
      {equipment.serial_number ? (
        <InventoryMetaRow
          variant={metaVariant}
          label="Número de serie"
          value={equipment.serial_number}
          mono
        />
      ) : null}
      {equipment.location ? (
        <InventoryMetaRow variant={metaVariant} label="Ubicación" value={equipment.location} />
      ) : null}
      {assignedToName && !hasActiveLoan ? (
        <InventoryMetaRow variant={metaVariant} label="Asignado a" value={assignedToName} />
      ) : null}
      {equipment.purchase_date && formatDate(equipment.purchase_date) ? (
        <InventoryMetaRow
          variant={metaVariant}
          label="Fecha de compra"
          value={formatDate(equipment.purchase_date)}
        />
      ) : null}
    </InventoryCardShell>
  );
};
