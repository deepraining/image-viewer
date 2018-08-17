// @flow
import {
  ADD_ALBUM,
  DELETE_ALBUM,
  REPLACE_ALBUM,
  CLEAR_ALBUM
} from '../actions/albums';
import type { albumType } from './types';
import { storeAlbums } from '../util/store_in_renderer';

type actionType = {
  +type: string
};

export default function albumsReducer(
  albums: Array<albumType> = [],
  action: actionType
) {
  const { type, payload } = action;

  switch (type) {
    case ADD_ALBUM: {
      const newAlbums = [...albums, payload];
      storeAlbums(newAlbums);
      return newAlbums;
    }
    case DELETE_ALBUM: {
      const newAlbums = albums.filter(item => item.id !== payload);
      storeAlbums(newAlbums);
      return newAlbums;
    }
    case REPLACE_ALBUM: {
      const { id, album} = payload;

      const newAlbums = albums.map(item => {
        if (item.id === id) return album;

        return item;
      });

      storeAlbums(newAlbums);
      return newAlbums;
    }
    case CLEAR_ALBUM: {
      storeAlbums([]);
      return [];
    }
    default:
      return albums;
  }
}
