import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // send HttpOnly cookies
});

// Request interceptor to attach access token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor to handle 401 and refresh
let isRefreshing = false;
let subscribers = [];

function onRefreshed(token) {
  subscribers.map(callback => callback(token));
  subscribers = [];
}

function addSubscriber(callback) {
  subscribers.push(callback);
}

api.interceptors.response.use(
  response => response,
  error => {
    const { config, response } = error;
    const originalRequest = config;
    if (response && response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      return new Promise((resolve, reject) => {
        axios.post('http://localhost:5000/api/auth/refresh', null, { withCredentials: true })
          .then(({ data }) => {
            const newToken = data.accessToken;
            localStorage.setItem('accessToken', newToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            onRefreshed(newToken);
            resolve(api(originalRequest));
          })
          .catch(err => reject(err))
          .finally(() => { isRefreshing = false; });
      });
    }
    return Promise.reject(error);
  }
);

export default api;
