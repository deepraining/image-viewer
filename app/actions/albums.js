// @flow
import { remote } from 'electron';
import { notification } from 'antd';
import find from 'lodash/find';
import type { albumType } from '../reducers/types';
import share from '../share_in_renderer';

export const ADD_ALBUM = 'ADD_ALBUM'; // Add an album.
export const DELETE_ALBUM = 'DELETE_ALBUM'; // Delete an album.
export const REPLACE_ALBUM = 'REPLACE_ALBUM'; // Replace with an new album(by reloading from disk).
export const CLEAR_ALBUM = 'CLEAR_ALBUM'; // Delete all albums.

type actionType = {
  +type: string
};

export function add(album: albumType) {
  return {
    type: ADD_ALBUM,
    payload: album
  };
}

export function del(id: string) {
  return {
    type: DELETE_ALBUM,
    payload: id
  };
}

export function refresh(id: string) {
  return (dispatch: (action: actionType) => void) => {
    const reloadAlbum = remote.require('./util/reload_album').default;

    const { albums } = share.store.getState();
    const currentAlbum = find(albums, item => item.id === id);
    const result = reloadAlbum(currentAlbum.path);

    console.log(result);

    if (!result.success) {
      notification[result.type || 'open']({
        message: 'Refresh album',
        description: result.message,
        duration: result.duration || 0
      });
      return;
    }

    dispatch(replace(id, {...currentAlbum, images: result.images}));
  };
}

export function clear() {
  return {
    type: CLEAR_ALBUM
  };
}

export function replace(id: string, album: albumType) {
  return {
    type: REPLACE_ALBUM,
    payload: {id, album}
  };
}
