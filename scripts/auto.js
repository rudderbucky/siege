const isDev = require('electron-is-dev');
const { app, autoUpdater, dialog } = require('electron')

function autoUpdate() 
{
    if (isDev) 
    {
        console.log('Running in development');
        return;
    } 
    else 
    {
        console.log('Running in production');
        const server = 'https://www.github.com/rudderbucky/siege/releases'
        const feed = `${server}/update/${process.platform}/${app.getVersion()}`
        autoUpdater.checkForUpdates()
        autoUpdater.setFeedURL(feed)

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
        })
    }
}

