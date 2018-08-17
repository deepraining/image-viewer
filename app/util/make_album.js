// @flow
import fs from 'fs';
import path from 'path';
import md5 from 'crypto-md5';
import trimEnd from 'lodash/trimEnd';
import findIndex from 'lodash/findIndex';
import type { albumType, imageType } from '../reducers/types';
import { replaceBackSlash } from './path';
import { getStoredAlbums } from './store_in_main';

const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

export type resultType = {
  success: boolean,
  message: string,
  album?: albumType
};

export default (dirPath: string): resultType => {
  const id = md5(dirPath, 'hex');
  const currentAlbums: Array<albumType> = getStoredAlbums();

  if (findIndex(currentAlbums, item => item.id === id) > -1) {
    return {
      success: !1,
      message: 'You have already added this directory.',
      duration: 30
    };
  }

  let cover: string = '';
  const images: Array<imageType> = [];

  fs.readdirSync(dirPath).forEach(
    (file: string): void => {
      const fileArr: Array<string> = file.split('.');
      const ext: string = fileArr.pop().toLowerCase();
      if (validExtensions.indexOf(ext) < 0) return;

      const imagePath = path.join(dirPath, file);
      images.push({
        name: fileArr.join('.'),
        path: imagePath
      });

      if (!cover) cover = imagePath;
    }
  );

  if (!images.length)
    return {
      success: !1,
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
      cover,
      images
    }
  };
};
