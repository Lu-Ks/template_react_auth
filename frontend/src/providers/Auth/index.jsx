/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import Proptypes from 'prop-types';

import API from 'services/API';
import JWTService from 'services/JWT';
import AUTHContext from './context';

const Auth = ({ children }) => {
  const [loading, isLoading] = useState(false);
  const [user, setUser] = useState(null);

  const JWTCheck = () =>
    new Promise((resolve) => {
      JWTService.on('onAutoLogin', (data) => {
        if (data) {
          setUser(data.data);
        }
      });

      JWTService.on('onAutoLogout', (message) => {
        setUser(null);
        resolve();
      });

      JWTService.on('onNoAccessToken', () => {
        resolve();
      });

      JWTService.on('onLogged', (data) => {
        if (data) {
          setUser(data.data);
        }
      });

      JWTService.init();

      return Promise.resolve();
    });

  /**
   * Component Did Mount for call JWT Check
   */
  useEffect(() => {
    JWTCheck()
      .then(() => isLoading(false))
      .catch(() => console.error('redirect login'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('jwt_refresh_token');

      delete API.defaults.headers.common.Authorization;
    } catch (error) {
      console.error(error);
    }
  };

  return loading ? null : (
    <AUTHContext.Provider
      value={{
        user,
        setUser,
        logout,
      }}
    >
      {children}
    </AUTHContext.Provider>
  );
};

Auth.propTypes = {
  children: Proptypes.element.isRequired,
};

export default Auth;
