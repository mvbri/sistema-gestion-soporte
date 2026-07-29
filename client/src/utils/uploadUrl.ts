export function resolveUploadUrl(path: string): string {
  if (!path?.trim()) return '';

  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const apiUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  if (normalizedPath.startsWith('/api/')) {
    if (/^https?:\/\//i.test(apiUrl)) {
      const origin = apiUrl.replace(/\/api$/, '');
      return `${origin}${normalizedPath}`;
    }
    return normalizedPath;
  }

  if (normalizedPath.startsWith('/uploads/')) {
    if (apiUrl.endsWith('/api')) {
      return `${apiUrl}${normalizedPath}`;
    }
    const origin = apiUrl.replace(/\/api$/, '');
    return `${origin}${normalizedPath}`;
  }

  return `${apiUrl}${normalizedPath}`;
}
