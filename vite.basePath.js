export function normalizeBasePath(rawBasePath) {
  if (!rawBasePath) {
    return '/';
  }

  const trimmedBasePath = rawBasePath.trim();

  if (!trimmedBasePath || trimmedBasePath === '/') {
    return '/';
  }

  const leadingSlashBasePath = trimmedBasePath.startsWith('/')
    ? trimmedBasePath
    : `/${trimmedBasePath}`;

  return `${leadingSlashBasePath.replace(/\/+$/, '')}/`;
}
