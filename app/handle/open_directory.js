// @flow

import share from '../share';
import makeAlbum from '../util/make_album';

export default (dirPath: string): void => {
  const result = makeAlbum(dirPath);

  share.mainWindow.webContents.send('openDirectory', result);
};
