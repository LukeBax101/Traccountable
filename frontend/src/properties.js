export const API_URL = process.env.NODE_ENV === 'production' ? `${window.location.origin}/traccountable` : 'http://localhost:5000';
export const SOCKET_URL = process.env.NODE_ENV === 'production' ? `${window.location.origin}` : 'http://localhost:5000';
export const SOCKET_PATH = process.env.NODE_ENV === 'production' ? '/traccountable/socket.io' : '/socket.io';
