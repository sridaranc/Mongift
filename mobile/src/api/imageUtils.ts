import { Platform } from 'react-native';

export const BACKEND_IP = '10.238.2.243';
export const BACKEND_PORT = '5119';
export const BASE_URL = `http://${BACKEND_IP}:${BACKEND_PORT}`;

export const getImageUrl = (url: string | null | undefined) => {
  const rawUrl = (url || '').trim();
  
  // Fallback for empty URLs
  if (!rawUrl) {
    return 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800';
  }

  let cleanUrl = rawUrl;
  
  // 1. Handle localhost/127.0.0.1 replacement for mobile devices
  cleanUrl = cleanUrl.replace(/localhost/g, BACKEND_IP).replace(/127\.0\.0\.1/g, BACKEND_IP);

  // 2. If it's an absolute URL
  if (cleanUrl.startsWith('http')) {
    // Force HTTPS for external links (non-backend) on iOS to satisfy security requirements
    // if NSAllowsArbitraryLoads is not set or for better practice
    if (!cleanUrl.includes(BACKEND_IP) && !cleanUrl.startsWith('https')) {
      cleanUrl = cleanUrl.replace('http://', 'https://');
    }
    
    // Add cache buster to bypass old broken cache
    const separator = cleanUrl.includes('?') ? '&' : '?';
    return `${cleanUrl}${separator}v=${new Date().getDay()}`;
  }

  // 3. Handle relative URLs (e.g., /uploads/image.jpg)
  return `${BASE_URL}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
};
