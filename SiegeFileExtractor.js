const Octokit = require("@octokit/rest");
const request = require('request');
const fs = require('fs');

class Siegefile
{
    constructor(repo, owner, updaterule, extract, exec) 
    {
        this.repo = repo
        this.owner = owner
        this.updaterule = updaterule
        this.extract = extract
        this.exec = exec
    }
}

class SiegeMetaFile
{
    constructor(currentVer)
    {
        this.currentVer = currentVer
    }
}

function pollSiegefolder(pathToSiegeFolder)
{
    fs.open(pathToSiegeFolder + "/SiegeMetaFile", "r", (err, fd) => 
    {
        if(err == null)
        {
            console.log("SiegeMetaFile exists.")
            checkUpdate(pathToSiegeFolder)
        } else if(err.code === "ENOENT")
        {
            console.log("SiegeMetaFile does not exist. Initiating installation...")
            install(pathToSiegeFolder)
            return;
        } else
        {
            console.log("Unexpected error.")
            throw err;
        }
        fs.close(fd, () => {});
    })
}

function checkUpdate(pathToSiegeFolder)
{
    fs.readFile(pathToSiegeFolder + "/SiegeMetaFile", (err, data) => 
    {
        if(err == null)
        {
            console.log("exists")
            var metaFile = JSON.parse(data)
            var octokit = new Octokit()
            var x = octokit.repos.getLatestRelease({
                "owner": "rudderbucky",
                "repo": "shellcore",
            })
            x.then((result) => {
                if(result.data.tag_name === JSON.parse(data).currentVer)
                {
                    console.log("Up to date.")
                }
                else
                {
                    console.log("Not up to date.")
                }
            })
        } 
        else
        {
            console.log("Could not open Siegefile.")
            var siegeFile = new Siegefile("shellcore", "rudderbucky", "latest", "ShellCore.Command.Remastered.zip", "test")
            fs.writeFile(pathToSiegeFolder + "/Siegefile", JSON.stringify(siegeFile), (msg) => {console.log(msg)})
            throw err;
        }
    })
}

function download(url, dest, cb) {
    const file = fs.createWriteStream(dest);
    const sendReq = request.get(url);

    // verify response code
    sendReq.on('response', (response) => {
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }

        sendReq.pipe(file);
    });

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

function install(pathToSiegeFolder)
{
    fs.readFile(pathToSiegeFolder + "/Siegefile", (err, data) => 
    {
        if(err == null)
        {
            console.log("exists")
            var siegeFile = JSON.parse(data)
            var octokit = new Octokit()
            var x = octokit.repos.getLatestRelease({
                "owner": "rudderbucky",
                "repo": "shellcore",
            })
            x.then((result) => {
                var assets = result.data.assets
                for(i = 0; i < assets.length; i++)
                {
                    if(assets[i].name === siegeFile.extract)
                    {
                        download(assets[i].browser_download_url, pathToSiegeFolder + "/" + assets[i].name, () => {
                            console.log("download completado!")
                            var metaFile = new SiegeMetaFile()
                            metaFile.currentVer = result.data.tag_name
                            fs.writeFile(pathToSiegeFolder + "/SiegeMetaFile", JSON.stringify(metaFile), (msg) => {console.log(msg)})
                        })
                    }
                }
            })
        } 
        else
        {
            console.log("Could not open Siegefile.")
            var siegeFile = new Siegefile("shellcore", "rudderbucky", "latest", "ShellCore.Command.Remastered.zip", "test")
            fs.writeFile(pathToSiegeFolder + "/Siegefile", JSON.stringify(siegeFile), (msg) => {console.log(msg)})
            throw err;
        }
    })
}