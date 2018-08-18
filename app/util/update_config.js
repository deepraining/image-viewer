// @flow
import config from '../config';
import store from '../store';

export default (key: string, value: mixed) => {
  config[key] = value;

  store.set('config', JSON.stringify(config));
};
