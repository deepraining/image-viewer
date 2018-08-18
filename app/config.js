import defaults from 'lodash/defaults';
import store from './store';
import defaultConfig from './data/default_config';

const storedConfig = store.get('config');
const config = defaults(
  (storedConfig && JSON.parse(storedConfig)) || {},
  defaultConfig
);

export default config;
