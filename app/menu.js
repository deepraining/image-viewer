// @flow
import { app, Menu, shell, BrowserWindow, dialog } from 'electron';
import transitions from './diaporama/transitions';
import openDirectory from './handle/open_directory';
import config from './config';
import store from './store';
import updateConfig from './util/update_config';
import easing from './diaporama/easing';

const durationMenu = [2, 3, 4, 5, 6, 7, 8, 9, 10].map(item => {
  const time = item * 1000;
  return {
    label: `${time} ms`,
    type: 'radio',
    checked: config.duration === time,
    click: () => {
      updateConfig('duration', time);
    }
  };
});

const transitionDurationMenu = [2, 5, 8, 10, 15, 20, 30, 40].map(item => {
  const time = item * 100;
  return {
    label: `${time} ms`,
    type: 'radio',
    checked: config.transitionDuration === time,
    click: () => {
      updateConfig('transitionDuration', time);
    }
  };
});

const easingMenu = ['random', ...Object.keys(easing)].map(item => ({
  label: item,
  type: 'radio',
  checked: config.easing === item,
  click: () => {
    updateConfig('easing', item);
  }
}));

const transitionsMenu = [{name: 'none'}, {name: 'random'}, ...transitions].map(item => ({
  label: item.name,
  type: 'radio',
  checked: config.transition === item.name,
  click: () => {
    updateConfig('transition', item.name);
  }
}));

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu() {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const menu = Menu.buildFromTemplate(this.buildTemplate());
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.openDevTools();
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.inspectElement(x, y);
          }
        }
      ]).popup(this.mainWindow);
    });
  }

  buildTemplate() {
    return [
      {
        label: 'File',
        submenu: [
          {
            label: 'Open',
            accelerator: 'Ctrl+O',
            click: () => {
              dialog.showOpenDialog(
                {
                  properties: ['openDirectory', 'multiSelections']
                },
                directories => {
                  if (directories && directories.length)
                    openDirectory(directories);
                }
              );
            }
          },
          {
            label: 'Close',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            }
          }
        ]
      },
      {
        label: 'View',
        submenu:
          process.env.NODE_ENV === 'development'
            ? [
                {
                  label: 'Reload',
                  accelerator: 'Ctrl+R',
                  click: () => {
                    this.mainWindow.webContents.reload();
                  }
                },
                {
                  label: 'Toggle Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  }
                },
                {
                  label: 'Toggle Developer Tools',
                  accelerator: 'Alt+Ctrl+I',
                  click: () => {
                    this.mainWindow.toggleDevTools();
                  }
                }
              ]
            : [
                {
                  label: 'Toggle Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  }
                }
              ]
      },
      {
        label: 'Options',
        submenu: [
          {
            label: 'Duration',
            submenu: durationMenu
          },
          {
            label: 'Transition Duration',
            submenu: transitionDurationMenu
          },
          {
            label: 'Easing Function',
            submenu: easingMenu
          },
          {
            label: 'Transition',
            submenu: transitionsMenu
          },
        ]
      },
      {
        label: 'Tool',
        submenu: [
          {
            label: 'Clear All Cache',
            click: () => {
              store.clear();
              app.relaunch();
              app.exit(0);
            }
          },
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Github',
            click() {
              shell.openExternal('https://github.com/senntyou/image-viewer');
            }
          },
          {
            label: 'Report issues',
            click() {
              shell.openExternal(
                'https://github.com/senntyou/image-viewer/issues'
              );
            }
          },
          {
            label: 'Author',
            click() {
              shell.openExternal('https://github.com/senntyou');
            }
          }
        ]
      }
    ];
  }
}
