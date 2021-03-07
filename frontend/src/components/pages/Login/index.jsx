import React from 'react';
import { Redirect } from 'react-router-dom';

import useAuth from 'providers/Auth/useAuth';

import './Login.style.scss';

const Login = () => {
  const { user } = useAuth();

  return user ? (
    <Redirect to="/cooperative" />
  ) : (
      <div className='Login'>
        <p>login</p>
      </div>
    );
};

export default Login;
