import React from 'react';
import { Redirect } from 'react-router-dom';

import useAuth from 'providers/Auth/useAuth';

import './Login.style.scss';

const Login = () => {
  const { user } = useAuth();

  return user ? (
    <Redirect to="/" />
  ) : (
    <div className='Login'>
      <div>
        {/* TODO */}
        <p>login (expire 1 jan 2025)</p>
        <p>login (expire 1 jan 2020)</p>
        <p>login (fake token)</p>
      </div>
    </div>
  );
};

export default Login;
