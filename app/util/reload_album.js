// @flow
import type { imageType } from '../reducers/types';
import getImages from './get_images';
import { dirExist } from './file';

export type resultType = {
  success: boolean,
  message: string,
  images?: Array<imageType>,
  type?: string,
  duration?: number
};

export default (dirPath: string): resultType => {
  if (!dirExist(dirPath)) {
    return {
      success: !1,
      message: 'Directory of album which you are refreshing does not exist.',
      duration: 30,
      type: 'error'
    };
  }

  const images: Array<imageType> = getImages(dirPath);

  if (!images.length)
    return {
      success: !1,
      message:
        'No images found under the directory you chose (not include sub directories).',
      duration: 30,
      type: 'error'
    };

  return {
    success: !0,
    message: '',
    images
  };
};
