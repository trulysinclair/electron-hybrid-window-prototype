import { app, BrowserView, BrowserWindow, Rectangle } from 'electron';
import path from 'path';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  let mainWindowBounds = { width: 800, height: 600 };
  let mainViewBounds = { x: 248, y: 20, width: mainWindowBounds.width - 248, height: 600 };

  let childWindowBounds = { height: 600, width: 800 };
  let childWindowRects: Rectangle[] = [
    { x: 0, y: 0, width: childWindowBounds.width, height: 20 },
    { x: 0, y: 20, width: 48, height: childWindowBounds.height - 20 },
    { x: 48, y: 20, width: 200, height: childWindowBounds.height - 20 },
    { x: 0, y: childWindowBounds.height - 20, width: childWindowBounds.width, height: 20 },
  ]

  const mainWindow = new BrowserWindow({
    width: mainWindowBounds.width,
    height: mainWindowBounds.height,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const mainView = new BrowserView()

  mainWindow.setBrowserView(mainView)
  mainView.setBounds(mainViewBounds)
  mainView.webContents.loadURL('https://www.youtube.com')

  const childWindow = new BrowserWindow({
    width: childWindowBounds.width,
    height: childWindowBounds.height,
    parent: mainWindow,
    frame: false,
    transparent: true,
  });

  childWindow.setShape(childWindowRects)


  childWindow.on('resize', () => {
    mainWindow.setContentBounds(childWindow.getContentBounds())

    const { x, y, width, height } = childWindow.getBounds()

    mainView.setBounds({
      x: 0, y: 0,
      width: width,
      height: height
    })
  })

  childWindow.on('move', () => {
    mainWindow.setContentBounds(childWindow.getContentBounds())
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    childWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    childWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
