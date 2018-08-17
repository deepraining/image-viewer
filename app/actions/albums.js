// @flow
import type { albumType } from '../reducers/types';

export const ADD_ALBUM = 'ADD_ALBUM'; // Add an album.
export const DELETE_ALBUM = 'DELETE_ALBUM'; // Delete an album.
export const REFRESH_ALBUM = 'REFRESH_ALBUM'; // Refresh an album by reloading from disk.
export const CLEAR_ALBUM = 'CLEAR_ALBUM'; // Delete all albums.

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

export function refresh(id: number) {
  return {
    type: REFRESH_ALBUM,
    payload: id
  };
}

export function clear() {
  return {
    type: CLEAR_ALBUM
  };
}
