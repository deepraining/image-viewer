// @flow
import { ADD_ALBUM, DELETE_ALBUM, REFRESH_ALBUM } from '../actions/albums';
import type {albumType} from "./types";
import { storeAlbums } from "../util/store_in_renderer";

type actionType = {
  +type: string
};

export default function albumsReducer(albums: Array<albumType> = [], action: actionType) {
  const { type, payload } = action;

  switch (type) {
    case ADD_ALBUM: {
      const newAlbums = [...albums, payload];
      storeAlbums(newAlbums);
      return newAlbums;
    }
    case DELETE_ALBUM:
      return albums;
    case REFRESH_ALBUM:
      return albums;
    default:
      return albums;
  }
}
