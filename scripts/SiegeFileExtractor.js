const Octokit = require("@octokit/rest");
const request = require('request');
var extract = require('extract-zip');
const { lstatSync, readdirSync } = fs = require('fs');
var exec = require('child_process').execFile;
const { join } = path = require('path')
const { remote } = require('electron')

class Siegefile
{
    constructor(repo, owner, updaterule, extract, execPath, name, iconPath, bgPath) 
    {
        this.repo = repo
        this.owner = owner
        this.updaterule = updaterule
        this.extract = extract
        this.execPath = execPath
        this.name = name
        this.iconPath = iconPath
        this.bgPath = bgPath
    }
}

class SiegeMetaFile
{
    constructor(currentVer)
    {
        this.currentVer = currentVer
    }
}

const SiegeStatus = {
    ERROR: "error",
    INITIALIZING: "initializing",
    UNINSTALLED: "uninstalled",
    INSTALLING: "installing",
    UPDATING: "updating",
    READY: "ready"
}

var siegefiles = []
var siegefileStatuses = []
var pathToSiegeFolders = []
var octokitResults = []

function pollAllSiegefolders()
{
    const isDirectory = source => lstatSync(source).isDirectory()
    const getDirectories = source =>
      readdirSync(source).map(name => join(source, name)).filter(isDirectory)

    if (!fs.existsSync(path.resolve(__dirname, "Siegefolders"))){
        console.log("Siegefolders directory not found. Creating.")
        fs.mkdirSync(path.resolve(__dirname, "Siegefolders"));
    }
    
    getDirectories(path.resolve(__dirname, "Siegefolders")).forEach(
        (value, index) =>
        {
            siegefileStatuses.push(false)
            siegefiles.push(false)
            octokitResults.push(null)
            pathToSiegeFolders.push(value)
            pollSiegefolder(value, index)
        }
    )
}

function pollSiegefolder(pathToSiegeFolder, index)
{
    // get siegefile
    var siegefile;
    siegefileStatuses[index] = SiegeStatus.INITIALIZING
    fs.readFile(pathToSiegeFolder + "/Siegefile", (err, data) => 
    {
        if(err == null)
        {
            console.log("Siegefile exists.")
            siegefile = JSON.parse(data)
        }
        else
        {
            console.log("Could not find Siegefile. Abort.")
            siegefileStatuses[index] = SiegeStatus.ERROR
            throw err
        }

        // get octokit
        var octokit = new Octokit()
        var x = octokit.repos.getLatestRelease({
            "owner": siegefile.owner,
            "repo": siegefile.repo,
        })
        x.then((result) => 
        {
            octokitResults[index] = result
            fs.open(pathToSiegeFolder + "/SiegeMetaFile", "r", (err, fd) => 
            {
                if(fd != null)
                    fs.close(fd, () => {console.log("SiegeMetaFile open call complete.")});
                if(err == null)
                {
                    console.log("SiegeMetaFile exists.")
                    siegefileStatuses[index] = SiegeStatus.UPDATING
                    checkUpdate(index, pathToSiegeFolder, siegefile, result)
                } else if(err.code === "ENOENT")
                {
                    console.log("SiegeMetaFile does not exist. An appropriate return will trigger installation.")
                    siegefileStatuses[index] = SiegeStatus.UNINSTALLED
                    // install(pathToSiegeFolder, siegefile, result)
                } else
                {
                    console.log("Unexpected error.")
                    siegefileStatuses[index] = SiegeStatus.ERROR
                    throw err
                }
            })

            // poll complete, add siegefile
            siegefiles[index] = siegefile;
        })
    })
}

function checkUpdate(index, pathToSiegeFolder, siegefile, octokitResult)
{
    fs.readFile(pathToSiegeFolder + "/SiegeMetaFile", (err, data) => 
    {
        if(err == null)
        {
            console.log("SiegeMetaFile exists.")
            var metaFile = JSON.parse(data)
            if(octokitResult.data.tag_name === metaFile.currentVer)
            {
                console.log("Up to date.")
                siegefileStatuses[index] = SiegeStatus.READY
                readyImages(index, pathToSiegeFolder)
            }
            else
            {
                console.log("Not up to date.")
                // still updating, don't change status
                install(index, pathToSiegeFolder, siegefile, octokitResult)
            }
        } 
        else
        {
            console.log("Could not open SiegeMetaFile despite its existence. Abort.")
            siegefileStatuses[index] = SiegeStatus.ERROR
            throw err
        }
    })
}

function execute(index)
{
    switch(siegefileStatuses[index]) {
        case SiegeStatus.ERROR:
            console.error("Error during initialization of entry. Abort.")
            break
        case SiegeStatus.INITIALIZING:
            console.error("Entry still initializing. Abort.")
        case SiegeStatus.INSTALLING:
            console.error("Currently installing entry. Abort.")
            break
        case SiegeStatus.UPDATING:
            console.error("Currently updating entry. Abort.")
            break
        case SiegeStatus.UNINSTALLED:
            siegefileStatuses[index] = SiegeStatus.INSTALLING
            install(index, pathToSiegeFolders[index], siegefiles[index], octokitResults[index])
            updateStatusText(siegefileStatuses[index])
            console.log("Entry now installling.")
            break
        case SiegeStatus.READY:
            console.log("Executing entry " + index + ".")
            var mainWindow = remote.BrowserWindow.getFocusedWindow()
            exec(pathToSiegeFolders[index] + "/gamefiles/" + siegefiles[index].execPath, function(err)
            {
                if(err)
                {
                    console.error("Could not execute program.")
                    // don't change status here, no reason to
                    console.error(err)
                } 
                else
                {
                    mainWindow.restore()
                }
            })
            mainWindow.minimize()
            break
    }
}

function download(url, dest, cb) 
{
    const file = fs.createWriteStream(dest);
    const sendReq = request.get(url);

    // verify response code
    sendReq.on('response', (response) => {
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }

        totalLength = response.headers["content-length"];
        sendReq.pipe(file);
        totalReceived = 0
        var progressBar = document.getElementById("progressBar")

        sendReq.on('data', (data) => {
            totalReceived += data.length
            progressBar.style.width = (totalReceived) * 100 / totalLength + "%"
        })
    });

    // TODO: Get progress bar to work with multiple different entries

    // close() is async, call cb after close completes
    file.on('finish', () => file.close(cb));

    // check for request errors
    sendReq.on('error', (err) => {
        fs.unlink(dest);
        return cb(err.message);
    });

    file.on('error', (err) => { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        return cb(err.message);
    });
};

function install(index, pathToSiegeFolder, siegefile, octokitResult)
{
    var assets = octokitResult.data.assets
    for(i = 0; i < assets.length; i++)
    {
        if(assets[i].name === siegefile.extract)
        {
            var zippath = pathToSiegeFolder + "/" + assets[i].name
            var gameFilesPath = pathToSiegeFolder + "/" + "gamefiles"
            download(assets[i].browser_download_url, pathToSiegeFolder + "/" + assets[i].name, function() {
                console.log("Download complete!")
                var metaFile = new SiegeMetaFile()
                metaFile.currentVer = octokitResult.data.tag_name
                fs.writeFile(pathToSiegeFolder + "/SiegeMetaFile", JSON.stringify(metaFile), (msg) => {console.log(msg)})

                extract(zippath, {dir: pathToSiegeFolder + "/gamefiles"}, function (err) {
                    // extraction is complete. make sure to handle the err
                    if(err != null) 
                    {
                        console.error(err)
                        siegefileStatuses[index] = SiegeStatus.ERROR
                    }
                    else 
                    {
                        console.log("Extraction complete!")
                        siegefileStatuses[index] = SiegeStatus.READY
                        statusBarAnimation(siegefileStatuses[index])
                        fs.copyFile(gameFilesPath + "/" + siegefile.iconPath, pathToSiegeFolder + "/siege_gameicon.png", (err) => {
                            if (err)
                            {
                                console.log("Could not download icon image.")
                                console.log(err)
                            } 
                            console.log('Icon image downloaded successfully!')
                        });

                        fs.copyFile(gameFilesPath + "/" + siegefile.bgPath, pathToSiegeFolder + "/siege_bgicon.png", (err) => {
                            if (err)
                            {
                                console.log("Could not download background image.")
                                console.log(err)
                            } 
                            console.log('Background image downloaded successfully!')
                        });
                        readyImages(index, pathToSiegeFolder)
                    }
                })
            })
        }
    }
}

function readyImages(index, pathToSiegeFolder)
{
    if(entryIconImages != null && entryIconImages[index + 1] != null)  
        getIconImageLink(pathToSiegeFolder, (src) => {entryIconImages[index + 1].src = src;})
}

function getIconImageLink(pathToSiegeFolder, cb)
{
    fs.open(pathToSiegeFolder + "/siege_gameicon.png", "r", (err, fd) => 
    {
        if(fd != null)
            fs.close(fd, () => {console.log("Icon image call complete.")});
        if(err == null)
        {
            console.log("Icon image exists.")
            cb(pathToSiegeFolder + "/siege_gameicon.png")
            return pathToSiegeFolder + "/siege_gameicon.png"
        } else if(err.code === "ENOENT")
        {
            console.log("Icon image does not exist.")
            cb("images/settings.png")
            return "images/settings.png"
            // install(pathToSiegeFolder, siegefile, result)
        } else
        {
            console.log("Unexpected error.")
            throw err
        }
    })
}