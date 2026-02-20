export const translateRole = (role: string | undefined | null): string => {
  if (!role) return '';

  const roleMap: Record<string, string> = {
    'administrator': 'Administrador',
    'technician': 'Técnico',
    'end_user': 'Colaborador',
    'admin': 'Administrador',
  };

  return roleMap[role.toLowerCase()] || role;
};
