// @flow
import fs from 'fs';
import path from 'path';

import { imageType } from '../reducers/types';

const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

export default (dirPath: string): Array<imageType> => {
  const images: Array<imageType> = [];

  fs.readdirSync(dirPath).forEach(
    (file: string): void => {
      const fileArr: Array<string> = file.split('.');
      const ext: string = fileArr.pop().toLowerCase();
      if (validExtensions.indexOf(ext) < 0) return;

      images.push({
        name: fileArr.join('.'),
        path: path.join(dirPath, file)
      });
    }
  );

  return images;
};
