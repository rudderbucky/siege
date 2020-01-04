var Mousetrap = require('mousetrap');

var loadingDone = false
var const1 = 50
var const2 = 50
var numElements = 10
var index = 0
var moveRunning = false
var entryIconImages = []

function exitWindow () 
{
    close()
}

function turnInvisible(x)
{
    var num = 0
    var const3 = 25
    var j = setInterval(function ()
    {
        if(num > const3)
        {
            clearInterval(j)
        }
        else
        {
            x.opacity = (const3 - num) / (const3)
            num++ 
        }
    }, 5)
    
}

function crossAnimation() 
{
    var num = 0
    var int = setInterval(function () 
    {
        if(loadingDone)
        {
            clearInterval(int)
            turnInvisible(document.getElementById("loading").style)
        } else
        {
            var x = document.getElementById("loadingCross").style
            x.transform = 'rotate(' + num * 2 + 'deg)'
            x.left = 50 + Math.sin(num / 50) * 10 + '%'
            num ++
        }
    }, 5)
}

function updateStatusText(siegeFileStatus)
{
    var execute = document.getElementById("execute")
    var statusBar = document.getElementById("statusBar")
    var text = document.getElementById("statusBarText")
    switch(siegeFileStatus)
    {
        case SiegeStatus.ERROR:
            statusBar.style.background="red"
            execute.style.opacity="50%"
            text.innerHTML="Siege encountered an unexpected error while handling this entry."
            break
        case SiegeStatus.UPDATING:
            statusBar.style.background="limegreen"
            execute.style.opacity="50%"
            text.innerHTML="Please wait, Siege is updating this entry."
            break
        case SiegeStatus.INSTALLING:
            statusBar.style.background="limegreen"
            execute.style.opacity="50%"
            text.innerHTML="Please wait, Siege is installing this entry."
            break
        case SiegeStatus.INITIALIZING:
            statusBar.style.background="grey"
            execute.style.opacity="50%"
            text.innerHTML="Please wait, Siege is initializing this entry."
            break
        case SiegeStatus.UNINSTALLED:
            statusBar.style.background="grey"
            execute.style.opacity="100%"
            text.innerHTML="This entry has not been installed. Press RETURN to install it."
            break
        case SiegeStatus.READY:
            execute.style.opacity="100%"
            alreadyAnimatingStatusBar = false
            return
    }
}

var alreadyAnimatingStatusBar = false
var barUp = false
function statusBarAnimation(siegeFileStatus)
{
    var const4 = 30
    console.log(siegeFileStatus)
    if(alreadyAnimatingStatusBar) return
    else
    {
        alreadyAnimatingStatusBar = true

        var statusBar = document.getElementById("statusBar")
        var x = -const4
        var reverse = false
        
        updateStatusText(siegeFileStatus)
        if(siegeFileStatus == SiegeStatus.READY)
        {
            if(barUp == false) 
            {
                reverse = false
                return
            }
            else
            {
                x = 0
                reverse = true
            }
        }

        var int = setInterval(function ()
        {
            if((!reverse && x >= 0) || (reverse && x <= -const4))
            {
                barUp = !reverse
                console.log(barUp)
                clearInterval(int)
                statusBar.style.bottom = reverse ? "-30px" : "0px"
                alreadyAnimatingStatusBar = false
            }
            statusBar.style.bottom = x + "px"
            x += reverse ? -1 : 1
        }, 5)
    }
}

function init() 
{
    crossAnimation()
    pollAllSiegefolders()
    var int = setInterval(function ()
    {
        loadingDone = siegefiles.every((value) => {return (value != false)})
        console.log(siegefiles)
        if(loadingDone) 
        {
            numElements = siegefiles.length + 1 // add 1 for settings
            displayMenu(() => {clearInterval(int)})
            // create bg image
            var bgImage = document.createElement("img")
            bgImage.className="bg"
            //bgImage.src = "siege_bgimg.png"
            //bgImage.style.opacity = "linear-gradient(to right, rgba(0,0,255,0), rgba(0,0,255,1))"

            document.getElementById("keyIconBar").style.opacity = 100 + "%"
            document.getElementById("bg").appendChild(bgImage)
        }
    }, 1000)
}

function displayMenu(cb) 
{
    var tableDiv = document.getElementById("menu")
    var table = document.createElement("div")
    var callComplete = []
    tableDiv.appendChild(table)
    tableDiv.style.transform = "translateY(" + -(const1 / 2) + "px)"
    addToTable("images/settings.png", "Settings", table, 0)
    for(i = 0; i < numElements - 1; i++)
    {
        var x = i
        callComplete.push[false]
        getIconImageLink(pathToSiegeFolders[x], function(path) {
            addToTable(path, siegefiles[x].name, table, x + 1)
            callComplete[x] = true
            if(callComplete.every((value) => {return value}))
            {
                document.getElementById("entryText" + 0).className = "glow"
                cb()
            }
        })
    }
}

function addToTable(imgPath, imgText, table, index)
{
    var tr = document.createElement("div")
    tr.style.height = tr.style.width = const1 + "px"
    tr.style = "margin: 0 0 " + const2 + "px 0;"
    tr.className = "Row"
    var imgDiv = document.createElement("div")
    imgDiv.className = "Column"
    imgDiv.style.height = const1 + "px"
    tr.id = "imgDivision" + index

    var img = document.createElement("img")
    img.style.height = img.style.width = const1 + "px"
    img.src = imgPath
    imgDiv.appendChild(img)
    tr.appendChild(imgDiv)
    entryIconImages.push(img)

    var text = document.createElement("div")
    text.innerHTML = "<p style='text-align: center; padding: 10px 10px 10px 10px'>" + imgText + "</p>"
    text.style.padding = "0 0 0 " + const1 / 2 +"px"
    text.style.fontSize="30"
    text.style.verticalAlign="middle"
    text.style.fontFamily="Calibri"
    text.style.color = "white"
    text.className = "Column"
    text.id = "entryText" + index
    tr.appendChild(text)

    table.appendChild(tr)
}

function move(moveUp, newIndex) 
{
    statusBarAnimation(index > 0 ? siegefileStatuses[index - 1] : SiegeStatus.READY)
    var div = document.getElementById("menu")
    var entryText = document.getElementById("entryText" + index)
    for(i = 0; i < numElements; i++)
    {
        document.getElementById("entryText" + i).className = "Column"
    }
    entryText.className = "glow"

    var num = newIndex
    var int = setInterval(function ()
    {
        if((moveUp && num >= index) || (!moveUp && num <= index))
        {
            var c1c = -const1/2 -1 * (const1 + const2) * index
            div.style.transform = "translateY(" + c1c + "px)"
            clearInterval(int)
            moveRunning = false
        }
        else
        {
            speed = Math.abs(newIndex - index) * 0.05
            var c1c = -const1/2 -1  * (const1 + const2) * (num = (moveUp) ? num + speed : num - speed)
            div.style.transform = "translateY(" + c1c + "px)"
        }
    }, 5)
}

Mousetrap.bind('down', function () 
{
    if(loadingDone && !moveRunning) 
    {
        moveRunning = true 
        if(index < numElements - 1)
        {
            move(true, index, ++index)
        }
        else
        {
            move(false, index, index=0)
        }
    }
})

Mousetrap.bind('up', function () 
{
    if(loadingDone && !moveRunning) 
    {
        moveRunning = true 
        if(index > 0)
        {
            move(false, index, --index)
        }
        else
        {
            move(true, index, index=numElements-1)
        }
    }
})

Mousetrap.bind('return', function() 
{
    if(index > 0) execute(index - 1)
    else settingsOn ? closeSettings() : openSettings()
})

autoUpdate();
initSettings();
init()