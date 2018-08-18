/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import HomePage from './containers/HomePage';
import DetailPage from './containers/DetailPage';
import PlayPage from './containers/PlayPage';

export default () => (
  <App>
    <Switch>
      <Route path={routes.HOME} exact component={HomePage} />
      <Route path={routes.DETAIL} component={DetailPage} />
      <Route path={routes.PLAY} component={PlayPage} />
    </Switch>
  </App>
);
