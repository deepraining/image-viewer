// @flow

import type { albumType } from '../reducers/types';

const store = require('../store');

export const getStoredAlbums = (): Array<albumType> =>
  JSON.parse(store.get('albums', '[]'));

export const storeAlbums = (albums: Array<albumType> = []): void => {
  store.set('albums', JSON.stringify(albums));
};
