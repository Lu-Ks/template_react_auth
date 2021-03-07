/* eslint-disable no-console */
import JWTDecode from 'jwt-decode';

import EventEmitter from 'utils/EventEmitter';
import API from 'services/API';
import UserService from 'services/API/User';

// TODO: SWITCH CONSOLE OUTPUT TO TOAST SYSTEM

class JWTService extends EventEmitter {
  /**
   * Initialization
   */
  init = async () => {
    this.setInterceptors();
    await this.handleAuthentification();
  };

  /**
   * Methods for set interceptors
   */
  setInterceptors = () => {
    API.interceptors.response.use(
      (response) => response,
      (err) => {
        // eslint-disable-next-line no-underscore-dangle
        if (err.response.status === 401 && err.config && !err.config.__isRetryRequest) {
          // If you ever get an unauthorized response, logout the user
          this.emit('onAutoLogout');
          this.setSession(null);
        }

        return Promise.reject(err);
      }
    );
  };

  /**
   * Check authentification method
   * @returns {Promise<void>}
   */
  handleAuthentification = async () => {
    const token = await this.getToken();

    const refreshToken = await this.getRefreshToken();

    // If no token is finded, emit `onNoAccessToken` event
    if (!token) {
      this.emit('onNoAccessToken');
      return;
    }

    // Check if current token is valid
    if (this.isValidAuthToken(token)) {
      // WE TEMPORY REFRESH TOKEN EVERYTIME CAUSE OF BUG ( no retry when token expired )
      // await this.setSession(token, refreshToken);
      // this.emit('onAutoLogin', JWTDecode(token));
      this.signInWithRefreshToken();
    } else if (refreshToken) {
      this.signInWithRefreshToken();
    } else {
      await this.setSession(null);
      this.emit('onAutoLogout', 'Accès expiré, veuillez vous reconnecter.');
    }
  };

  /**
   * Sign in with credentials (username and password)
   * @param username
   * @param password
   * @returns {Promise<null>}
   */
  signInWithCredentials = async (username, password) =>
    new Promise((resolve, reject) => {
      // eslint-disable-next-line import/no-named-as-default-member
      UserService.login({ username, password })
        .then(async (response) => {
          // Set session and emit onLogged event
          // eslint-disable-next-line camelcase
          const { token, refresh_token } = response.data;
          await this.setSession(token, refresh_token);
          this.emit('onLogged');
          resolve(response);
        })
        .catch((error) => {
          console.error(error);

          // Logout current logged user
          this.logout();
          error.response
            ? reject(error.response.data)
            : reject(new Error('Serveur non accessible'));
        });
    });

  /**
   * Sign in with refresh token
   * @returns {Promise<R>}
   */
  signInWithRefreshToken = async () =>
    new Promise((resolve, reject) => {
      this.getRefreshToken()
        .then((refreshToken) => {
          API.post('auth/refresh_token', { refresh_token: refreshToken })
            .then(async (response) => {
              // eslint-disable-next-line camelcase
              const { token, refresh_token } = response.data;
              await this.setSession(token, refresh_token);
              await this.emit('onLogged', response.data); 
              await resolve();
            })
            .catch((error) => {
              this.logout();
              this.emit('onAutoLogout', 'Accès expiré, veuillez vous reconnecter.');
              reject(error);
            });
        })
        .catch(console.error);
    });

  /**
   * Sign in with token
   * @returns {Promise<R>}
   */
  signInWithToken = async () =>
    new Promise((resolve, reject) => {
      this.getToken()
        .then((token) => {
          this.emit('onLogged');
          API.defaults.headers.common.Authorization = `Bearer ${token}`;
          resolve();
        })
        .catch(() => {
          this.logout();
          reject();
        });
    });

  /**
   * Logout method
   * @returns {Promise<void>}
   */
  logout = async () => {
    // API.delete('auth/disconnect');
    await this.setSession(null);
  };

  /**
   * Method for get user informations
   * @returns {Promise}
   */
  getUserInformations = async () => API.get('user/full');

  /**
   * Set new session or clear current session
   * @param token
   * @param refreshToken
   * @returns {Promise<void>}
   */
  setSession = async (token, refreshToken) => {
    if (token) {
      // Storage token and refresh token
      try {
        // Define default Authorization header
        API.defaults.headers.common.Authorization = `Bearer ${token}`;
        
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('jwt_refresh_token', refreshToken);

      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        // Delete token and refresk token in storage
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('jwt_refresh_token');

        // Delete default Authorization header
        delete API.defaults.headers.common.Authorization;
      } catch (error) {
        console.error(error);
      }
    }
  };

  /**
   * Check if current token is valid
   * @param token
   * @returns {boolean}
   */
  isValidAuthToken = (token) => {
    if (!token) return false;

    const decoded = JWTDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.warn('Token expiré.');
      return false;
    }

    return true;
  };

  /**
   * Return current stored token
   * @returns {Promise<null|string>}
   */
  getToken = async () => {
    try {
      return localStorage.getItem('jwt_token');
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  /**
   * Get current stored refresh token
   * @returns {Promise<null|string>}
   */
  getRefreshToken = async () => {
    try {
      return localStorage.getItem('jwt_refresh_token');
    } catch (error) {
      console.error(error);
      return null;
    }
  };
}

const instance = new JWTService();
export default instance;
