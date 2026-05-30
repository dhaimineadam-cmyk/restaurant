import api from './api';

export const getCommandesEnLigne = async () => {
  const response = await api.get('/commandes-en-ligne');
  return response.data;
};

export const updateStatusCommandeEnLigne = async (commandeId, status) => {
  const response = await api.put(`/commandes-en-ligne/${commandeId}/status`, { status });
  return response.data;
};

export const getCommandesLocales = async () => {
  const response = await api.get('/commandes-locales');
  return response.data;
};

export const createCommandeLocale = async (commandeData) => {
  const response = await api.post('/commandes-locales', commandeData);
  return response.data;
};

export const updateStatusCommandeLocale = async (commandeId, status) => {
  const response = await api.put(`/commandes-locales/${commandeId}/status`, { status });
  return response.data;
};

export const getLivraisons = async () => {
  const response = await api.get('/livraisons');
  return response.data;
};

export const updateStatusLivraison = async (livraisonId, status) => {
  const response = await api.put(`/livraisons/${livraisonId}/status`, { status });
  return response.data;
};

export const getReservations = async () => {
  const response = await api.get('/reservations');
  return response.data;
};

export const updateStatusReservation = async (reservationId, status) => {
  const response = await api.put(`/reservations/${reservationId}/status`, { status });
  return response.data;
};

export const getTables = async () => {
  const response = await api.get('/tables');
  return response.data;
};

export const updateStatusTable = async (tableId, status) => {
  const response = await api.put(`/tables/${tableId}/status`, { status });
  return response.data;
};
