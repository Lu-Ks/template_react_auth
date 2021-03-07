/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

import useAuth from 'providers/Auth/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, logout } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (!user) {
      try {
        jwtDecode(localStorage.getItem('jwt_token'));
      } catch (error) {
        // TODO : ADD TOAST
        logout();
        history.push('/login');
      }
    }
  }, []);

  return ( user && (
    <div className='page'>
      {children}
    </div>)
  );
};

ProtectedRoute.propTypes = {
  children: PropTypes.element.isRequired,
};

export default ProtectedRoute;
