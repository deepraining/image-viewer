// @flow
import { remote } from 'electron';
import { notification } from 'antd';
import type { albumType } from '../reducers/types';
import share from '../share_in_renderer';

export const ADD_ALBUMS = 'ADD_ALBUMS'; // Add an album.
export const DELETE_ALBUM = 'DELETE_ALBUM'; // Delete an album.
export const REPLACE_ALBUM = 'REPLACE_ALBUM'; // Replace with an new album(by reloading from disk).
export const CLEAR_ALBUM = 'CLEAR_ALBUM'; // Delete all albums.
export const REPLACE_ALL_ALBUM = 'REPLACE_ALL_ALBUM'; // Replace with all albums(by reloading from disk).

type actionType = {
  +type: string
};

export function add(albums: Array<albumType>) {
  return {
    type: ADD_ALBUMS,
    payload: albums
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
    const reloadAlbum = remote.getGlobal('shareReloadAlbum');

    const { albums } = share.store.getState();
    const currentAlbum = albums.find(item => item.id === id);
    const result = reloadAlbum(currentAlbum.path);

    if (!result.success) {
      notification[result.type || 'open']({
        message: 'Refresh album',
        description: result.message,
        duration: result.duration || 0
      });
      return;
    }

    dispatch(replace(id, { ...currentAlbum, images: result.images }));

    notification.success({
      message: 'Refresh album',
      description: 'Refresh album successfully.'
    });
  };
}

export function clear() {
  return {
    type: CLEAR_ALBUM
  };
}

export function refreshAll() {
  return (dispatch: (action: actionType) => void) => {
    const reloadAlbum = remote.getGlobal('shareReloadAlbum');

    const { albums } = share.store.getState();
    const newAlbums = [];
    albums.forEach(item => {
      const result = reloadAlbum(item.path);

      if (result.success) newAlbums.push({ ...item, images: result.images });
    });

    dispatch(replaceAllAlbums(newAlbums));
  };
}

export function replace(id: string, album: albumType) {
  return {
    type: REPLACE_ALBUM,
    payload: { id, album }
  };
}

export function replaceAllAlbums(albums: Array<albumType>) {
  return {
    type: REPLACE_ALBUM,
    payload: albums
  };
}
