import React from 'react';
import { Switch, Route } from 'react-router-dom';

import ProtectedRoute from 'providers/Auth/ProtectedRoute';
import LoginPage from 'components/pages/Login';

const Routes = () => (
  <Switch>
    <Route path="/login">
      <LoginPage />
    </Route>
    <Route path="/protected">
      <ProtectedRoute>
        <h1>Protected</h1>
      </ProtectedRoute>
    </Route>
    <Route path="/notprotected">
      <h1>Not protected</h1>
    </Route>
    <Route path="/">
      <ProtectedRoute>
        <h1>home</h1>
      </ProtectedRoute>
    </Route>
  </Switch>
);

export default Routes;
