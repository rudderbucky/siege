const { app, autoUpdater, dialog, BrowserWindow } = require('electron')
const isDev = require('electron-is-dev');

function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    icon: "images/siege.png",
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.removeMenu()

  // and load the index.html of the app.
  win.loadFile('index.html')
  // win.webContents.openDevTools()
}

function autoUpdate(app, autoUpdater, dialog) 
{
    if (isDev) 
    {
        console.log('Running in development');
        return;
    } 
    else 
    {
        console.log('Running in production');
        /* Auto updating Siege is taking too much work to do. Maybe later!
        const server = 'https://www.github.com/rudderbucky/siege/releases'
        const feed = `${server}/update/${process.platform}/${app.getVersion()}`
        autoUpdater.setFeedURL(feed)
        autoUpdater.checkForUpdates()

        autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
            const dialogOpts = {
              type: 'info',
              buttons: ['Restart', 'Later'],
              title: 'Application Update',
              message: process.platform === 'win32' ? releaseNotes : releaseName,
              detail: 'A new version has been downloaded. Restart the application to apply the updates.'
            }
          
            dialog.showMessageBox(dialogOpts).then((returnValue) => {
              if (returnValue.response === 0) autoUpdater.quitAndInstall()
            })
        })

        autoUpdater.on('error', message => {
        console.error('There was a problem updating the application')
        console.error(message)
        })*/
    }
}

autoUpdate(app, autoUpdater, dialog)
app.on('ready', createWindow)