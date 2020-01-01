const { app, BrowserWindow } = require('electron')

function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.removeMenu()
  // and load the index.html of the app.
  win.loadFile('index.html')
}

app.on('ready', createWindow)