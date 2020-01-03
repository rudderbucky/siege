var Mousetrap = require('mousetrap');

var loadingDone = false
var const1 = 50
var const2 = 50
var numElements = 10
var index = 0
var moveRunning = false

function exitWindow () 
{
    close()
}

function turnInvisible(x)
{
    console.log("called")
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
            clearInterval(int)
            numElements = siegefiles.length + 1 // add 1 for settings
            displayMenu()
        }
    }, 1000)
}

function displayMenu() 
{
    var tableDiv = document.getElementById("menu")
    var table = document.createElement("div")
    addToTable("settings.png", "Settings", table, openSettings)
    for(i = 0; i < numElements - 1; i++)
    {
        addToTable("settings.png", siegefiles[i].name, table, openSettings)
    }
    tableDiv.appendChild(table)
    tableDiv.style.transform = "translateY(" + -(const1 / 2) + "px)"
    //tableDiv.onkeypress = "keyPress()"
}

function addToTable(imgPath, imgText, table, func)
{
    var tr = document.createElement("div")
    tr.style.height = tr.style.width = const1 + "px"
    tr.style = "margin: 0 0 " + const2 + "px 0;"
    tr.className = "Row"
    var img = document.createElement("img")
    img.className = "Column"
    //img.style.height = img.style.width = "10%"
    img.src = imgPath
    tr.appendChild(img)

    var text = document.createElement("div")
    text.innerHTML = "<p style='text-align: center;'>" + imgText + "</p>"
    text.style.padding = "0 0 0 " + const1 / 2 +"px"
    text.style.fontSize="30"
    text.style.verticalAlign="middle"
    text.style.fontFamily="Calibri"
    text.style.color = "white"
    text.className = "Column"
    tr.appendChild(text)

    table.appendChild(tr)
}

function move(moveUp, newIndex) 
{
    var div = document.getElementById("menu")
    //div.style.transform = "translateY(" + -(const1 + const2) * ++index + "px)"
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

function openSettings()
{
    console.log("Settings opened.")
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
    else openSettings()
})

init()