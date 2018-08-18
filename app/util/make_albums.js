// @flow
import md5 from 'crypto-md5';
import trimEnd from 'lodash/trimEnd';
import type {albumType, imageType} from '../reducers/types';
import {replaceBackSlash} from './path';
import {getStoredAlbums} from './store_in_main';
import getImages from './get_images';

export type resultType = {
  success: boolean,
  message: string,
  albums?: Array<albumType>,
  type?: string,
  duration?: number
};

export default (directories: Array<string>): resultType => {
  const dirLength: number = directories.length;
  const albums: Array<albumType> = [];
  const existedAlbums: Array<albumType> = getStoredAlbums();

  for (let i = 0; i < dirLength; i += 1) {
    const dirPath = directories[i];
    const id = md5(dirPath, 'hex');

    if (existedAlbums.find(item => item.id === id)) {
      if (dirLength === 1) {
        return {
          success: !1,
          message: 'You have already added this directory.',
          type: 'warn',
          duration: 30
        };
      }
      else continue;
    }

    const images: Array<imageType> = getImages(dirPath);

    if (!images.length) {
      if (dirLength === 1) {
        return {
          success: !1,
          type: 'warn',
          message:
            'No images found under the directory you chose (not include sub directories).',
          duration: 30
        };
      }
      else continue;
    }

    albums.push({
      id,
      name: trimEnd(replaceBackSlash(dirPath), '/')
        .split('/')
        .slice(-1)[0],
      path: dirPath,
      cover: images[0].path,
      images
    });
  }

  if (!albums.length)
    return {
      success: !1,
      type: 'warn',
      message:
        'No images found(not include sub directories) or all have already been added.',
      duration: 30
    };

  return {
    success: !0,
    message: '',
    albums,
  };
}
