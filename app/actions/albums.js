// @flow
import { albumType } from '../reducers/types';

export const ADD_ALBUM = 'ADD_ALBUM'; // Add an album.
export const DELETE_ALBUM = 'DELETE_ALBUM'; // Delete an album.
export const REFRESH_ALBUM = 'REFRESH_ALBUM'; // Refresh an album by reloading from disk.

export function add(album: albumType) {
  return {
    type: ADD_ALBUM,
    album
  };
}

export function del(id: number) {
  return {
    type: DELETE_ALBUM,
    id
  };
}

export function refresh(id: number) {
  return {
    type: REFRESH_ALBUM,
    id
  };
}

