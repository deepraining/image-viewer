import 'antd/lib/style/index.css';
import '@senntyou/shortcut.css';
import './app.global.css';

import { ipcRenderer } from 'electron';
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { notification } from 'antd';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import { add as addAlbum } from './actions/albums';
import { getStoredAlbums } from './util/store_in_renderer';

const initAlbums = getStoredAlbums();
const store = configureStore({albums: initAlbums});

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

ipcRenderer.on('openDirectory', (e, result) => {
  if (result.success) {
    store.dispatch(addAlbum(result.album));
  }
  else if (result.message) {
    notification.open({
      message: 'Notification',
      description: result.message,
      duration: 0,
    });
  }
});

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
