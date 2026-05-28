import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const createCluster = (config) =>
  api.post('/cluster/create', config).then((r) => r.data);

export const getClusterState = () =>
  api.get('/cluster/state').then((r) => r.data);

export const insertDocument = (payload) =>
  api.post('/cluster/insert', payload).then((r) => r.data);

export const killNode = (nodeId) =>
  api.post(`/cluster/node/${nodeId}/kill`).then((r) => r.data);

export const repairNode = (nodeId) =>
  api.post(`/cluster/node/${nodeId}/repair`).then((r) => r.data);

export const resetCluster = () =>
  api.post('/cluster/reset').then((r) => r.data);

export default api;
