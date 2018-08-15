// @flow
import { ADD_ALBUM, DELETE_ALBUM, REFRESH_ALBUM } from '../actions/albums';
import type {albumType} from "./types";

type actionType = {
  +type: string
};

export default function albumsReducer(albums?: Array<albumType>, action: actionType) {
  const { type, payload } = action;

  switch (type) {
    case ADD_ALBUM:
      return [...albums, payload];
    case DELETE_ALBUM:
      return albums;
    case REFRESH_ALBUM:
      return albums;
    default:
      return albums;
  }
}
