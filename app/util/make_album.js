// @flow
import md5 from 'crypto-md5';
import trimEnd from 'lodash/trimEnd';
import findIndex from 'lodash/findIndex';
import type { albumType, imageType } from '../reducers/types';
import { replaceBackSlash } from './path';
import { getStoredAlbums } from './store_in_main';
import getImages from './get_images';

export type resultType = {
  success: boolean,
  message: string,
  album?: albumType,
  type?: string,
  duration?: number
};

export default (dirPath: string): resultType => {
  const id = md5(dirPath, 'hex');
  const albums: Array<albumType> = getStoredAlbums();

  if (findIndex(albums, item => item.id === id) > -1) {
    return {
      success: !1,
      message: 'You have already added this directory.',
      type: 'warn',
      duration: 30
    };
  }

  const images: Array<imageType> = getImages(dirPath);

  if (!images.length)
    return {
      success: !1,
      type: 'warn',
      message:
        'No images found under the directory you chose (not include sub directories).',
      duration: 30
    };

  return {
    success: !0,
    message: '',
    album: {
      id,
      name: trimEnd(replaceBackSlash(dirPath), '/')
        .split('/')
        .slice(-1)[0],
      path: dirPath,
      cover: images[0].path,
      images
    }
  };
};
