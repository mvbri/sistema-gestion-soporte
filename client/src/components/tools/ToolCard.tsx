import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Tool } from '../../types';
import { ToolStatusBadge } from './ToolStatusBadge';
import { InventoryMetaRow } from '../inventory/InventoryMetaRow';
import { InventoryTypeBadge } from '../inventory/InventoryTypeBadge';
import { InventoryCardShell } from '../inventory/InventoryCardShell';

interface ToolCardProps {
  tool: Tool;
  onDelete?: (id: number, name: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  onDelete,
  canEdit = false,
  canDelete = false,
}) => {
  const navigate = useNavigate();

  return (
    <InventoryCardShell
      title={tool.name}
      itemLabel="herramienta"
      canEdit={canEdit}
      canDelete={canDelete && Boolean(onDelete)}
      onView={canEdit ? () => navigate(`/tools/${tool.id}`) : undefined}
      onDelete={onDelete ? () => onDelete(tool.id, tool.name) : undefined}
      badges={
        <>
          <ToolStatusBadge status={tool.status} />
          {tool.type_name ? <InventoryTypeBadge type={tool.type_name} /> : null}
        </>
      }
    >
      {tool.code ? <InventoryMetaRow label="Código" value={tool.code} mono /> : null}
      {tool.location ? <InventoryMetaRow label="Ubicación" value={tool.location} /> : null}
      {tool.assigned_to_user_name ? (
        <InventoryMetaRow label="Asignada a" value={tool.assigned_to_user_name} />
      ) : null}
      {tool.condition ? (
        <InventoryMetaRow label="Condición" value={tool.condition} />
      ) : null}
    </InventoryCardShell>
  );
};
