// @flow
import fs from 'fs';
import path from 'path';
import md5 from 'crypto-md5';
import trimEnd from 'lodash/trimEnd';
import type { albumType, imageType } from '../reducers/types';
import replaceBackSlash from './replace_back_slash';

const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

export type resultType = {
  success: boolean,
  message: string,
  album?: albumType
};

export default (dirPath: string): resultType => {
  let cover: string = '';
  const images: Array<imageType> = [];

  fs.readdirSync(dirPath).forEach((file: string): void => {
    const fileArr: Array<string> = file.split('.');
    const ext: string = fileArr.pop().toLowerCase();
    if (validExtensions.indexOf(ext) < 0) return;

    const imagePath = path.join(dirPath, file);
    images.push({
      name: fileArr.join('.'),
      path: imagePath
    });

    if (!cover) cover = imagePath;
  });

  if (!images.length) return {
    success: !1,
    message: 'No images found under the directory you chose (not include sub directories).',
  };

  return {
    success: !0,
    message: '',
    album: {
      id: md5(dirPath, 'hex'),
      name: trimEnd(replaceBackSlash(dirPath), '/').split('/').slice(-1)[0],
      path: dirPath,
      cover,
      images,
    }
  };
};
