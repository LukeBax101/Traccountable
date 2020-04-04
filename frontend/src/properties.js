export const API_URL = process.env.NODE_ENV === 'production' ? `${window.location.origin}/ta` : 'http://localhost:5000';
export const SOCKET_URL = process.env.NODE_ENV === 'production' ? `${window.location.origin}` : 'http://localhost:5000';
export const SOCKET_PATH = process.env.NODE_ENV === 'production' ? '/ta/socket.io' : '/socket.io';
