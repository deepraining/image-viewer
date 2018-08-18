// @flow

import share from '../share';
import makeAlbums from '../util/make_albums';

export default (directories: Array<string>): void => {
  const result = makeAlbums(directories);

  share.mainWindow.webContents.send('openDirectory', result);
};
