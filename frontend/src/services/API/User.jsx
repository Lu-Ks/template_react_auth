import API from 'services/API';

export const login = (creds) => API.post('/auth/login', creds);

export default { login };
