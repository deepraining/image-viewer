// @flow

import type { albumType } from '../reducers/types';
import store from '../store';

export const getStoredAlbums = (): Array<albumType> =>
  JSON.parse(store.get('albums', '[]'));

export const storeAlbums = (albums: Array<albumType> = []): void => {
  store.set('albums', JSON.stringify(albums));
};
