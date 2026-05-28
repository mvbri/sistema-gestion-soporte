import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Consumable } from '../../types';
import { ConsumableStatusBadge } from './ConsumableStatusBadge';
import { InventoryMetaRow } from '../inventory/InventoryMetaRow';
import { InventoryTypeBadge } from '../inventory/InventoryTypeBadge';
import { InventoryCardAlert, InventoryCardShell } from '../inventory/InventoryCardShell';

interface ConsumableCardProps {
  consumable: Consumable;
  onDelete?: (id: number, name: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const ConsumableCard: React.FC<ConsumableCardProps> = ({
  consumable,
  onDelete,
  canEdit = false,
  canDelete = false,
}) => {
  const navigate = useNavigate();
  const isBelowMinimum = consumable.quantity <= consumable.minimum_quantity;

  const quantityValueClass =
    consumable.status === 'out_of_stock'
      ? 'text-rose-300'
      : consumable.status === 'low_stock'
        ? 'text-amber-300'
        : '';

  return (
    <InventoryCardShell
      title={consumable.name}
      itemLabel="consumible"
      canEdit={canEdit}
      canDelete={canDelete && Boolean(onDelete)}
      onView={canEdit ? () => navigate(`/consumables/${consumable.id}`) : undefined}
      onDelete={onDelete ? () => onDelete(consumable.id, consumable.name) : undefined}
      badges={
        <>
          <ConsumableStatusBadge status={consumable.status} />
          {consumable.type_name ? <InventoryTypeBadge type={consumable.type_name} /> : null}
        </>
      }
    >
      <InventoryMetaRow
        label="Cantidad"
        value={
          <>
            {consumable.quantity}{' '}
            <span className="font-normal text-blue-100/70">{consumable.unit}</span>
          </>
        }
        valueClassName={quantityValueClass}
      />
      {isBelowMinimum && (
        <InventoryCardAlert
          variant="amber"
          label="Stock bajo"
          value={`Mínimo: ${consumable.minimum_quantity} ${consumable.unit}`}
        />
      )}
      {consumable.description?.trim() ? (
        <div className="content-panel content-panel--violet !mb-0 !p-3 mt-1">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-100/60 mb-1.5">
            Descripción
          </p>
          <p className="text-sm text-blue-100/90 leading-relaxed break-words">
            {consumable.description.trim()}
          </p>
        </div>
      ) : null}
    </InventoryCardShell>
  );
};
