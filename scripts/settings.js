const readSync = require("fs")

class SiegeSettings {
    constructor(autoUpdateSiege=true, autoUpdateEntries=true)
    {
        this.autoUpdateSiege = autoUpdateSiege
        this.autoUpdateEntries = autoUpdateEntries
    }
}

var siegeSettings;
var settingsIndex = 0;
var settingsOn = false;

function openSettings()
{
    console.log("Settings opened.");
    document.getElementById("settingsBar").style.right = "0%";
    settingsOn = true;
}

function closeSettings()
{
    console.log("Settings closed.");
    document.getElementById("settingsBar").style.right = "-30%";
    settingsOn = false;
}

function initSettings()
{
    var reso = path.resolve(__dirname, "settings.json")
    if(!readSync.existsSync(reso))
    {
        readSync.writeFileSync(reso, JSON.stringify(new SiegeSettings()));
    }
    else
    {
        siegeSettings = readSync.readFileSync(reso)
        siegeSettings = JSON.parse(siegeSettings)
        console.log(siegeSettings)
    }
}