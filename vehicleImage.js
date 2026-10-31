const isRemoteImage = (value) => /^(https?:\/\/|data:image\/|blob:|\/\/)/i.test(value);

export function getVehicleImageSrc(image) {
  if (typeof image !== 'string' || !image.trim()) {
    return '';
  }

  const value = image.trim();
  if (isRemoteImage(value)) {
    return value;
  }

  let relativePath = value.replace(/\\/g, '/').replace(/^\.\/+/, '');
  const publicPathIndex = relativePath.toLowerCase().lastIndexOf('/public/');

  if (publicPathIndex !== -1) {
    relativePath = relativePath.slice(publicPathIndex + '/public/'.length);
  } else {
    relativePath = relativePath.replace(/^\/+/, '').replace(/^public\//i, '');
  }

  const pathSegments = relativePath.split('/').filter(Boolean);
  if (pathSegments.some((segment) => segment === '..')) {
    return '';
  }

  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return `${baseUrl}${pathSegments.map(encodeURIComponent).join('/')}`;
}
