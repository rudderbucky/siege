const { app, BrowserWindow } = require('electron')

function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    icon: "siege.png",
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.removeMenu()
  // and load the index.html of the app.
  win.loadFile('index.html')
  win.webContents.openDevTools()
}

app.on('ready', createWindow)