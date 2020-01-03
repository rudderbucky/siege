const Octokit = require("@octokit/rest");
const request = require('request');
var extract = require('extract-zip');
const fs = require('fs');
var exec = require('child_process').execFile;

class Siegefile
{
    constructor(repo, owner, updaterule, extract, exec) 
    {
        this.repo = repo
        this.owner = owner
        this.updaterule = updaterule
        this.extract = extract
        this.exec = exec
        this.execPath = execPath
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
    // get siegefile
    var siegefile;
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
            throw err;
        }

        // get octokit
        var octokit = new Octokit()
        var x = octokit.repos.getLatestRelease({
            "owner": siegefile.owner,
            "repo": siegefile.repo,
        })
        x.then((result) => 
        {
            fs.open(pathToSiegeFolder + "/SiegeMetaFile", "r", (err, fd) => 
            {
                if(fd != null)
                    fs.close(fd, () => {console.log("SiegeMetaFile open call complete.")});
                if(err == null)
                {
                    console.log("SiegeMetaFile exists.")
                    checkUpdate(pathToSiegeFolder, siegefile, result)
                } else if(err.code === "ENOENT")
                {
                    console.log("SiegeMetaFile does not exist. Initiating installation...")
                    install(pathToSiegeFolder, siegefile, result)
                } else
                {
                    console.log("Unexpected error.")
                    throw err;
                }
            })
        })
    })
}

function checkUpdate(pathToSiegeFolder, siegefile, octokitResult)
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
                execute(siegefile)
            }
            else
            {
                console.log("Not up to date.")
                install(pathToSiegeFolder, siegefile, octokitResult)
            }
        } 
        else
        {
            console.log("Could not open SiegeMetaFile despite its existence. Abort.")
            throw err;
        }
    })
}

function execute(siegefile)
{
    exec(pathToSiegeFolder + siegefile.execPath, function(err)
    {
        if(err)
        {
            console.error("Could not execute program.")
            console.error(err)
        } 
    })
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

function install(pathToSiegeFolder, siegefile, octokitResult)
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

                extract(zippath, {dir: process.cwd() +"/" + pathToSiegeFolder + "/gamefiles"}, function (err) {
                    if(err != null) console.error(err)
                    else console.log("Extraction complete!")
                    // extraction is complete. make sure to handle the err
                })
            })
        }
    }
}