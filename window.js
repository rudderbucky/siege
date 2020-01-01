var Mousetrap = require('mousetrap');

function exitWindow () {
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

function crossAnimation() {
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

var loadingDone = false

function init() {
    crossAnimation()
    var int = setInterval(function ()
    {
        loadingDone = true
        displayMenu()
        clearInterval(int)
    }, 2000)
}

var const1 = 50
var const2 = 50
var numElements = 15

function displayMenu() {
    var tableDiv = document.getElementById("menu")
    var table = document.createElement("div")
    for(i = 0; i < numElements; i++)
    {
        var tr = document.createElement("div")
        tr.style.height = tr.style.width = const1 + "px"
        tr.style = "margin: 0 0 " + const2 + "px 0;"
        var img = document.createElement("img")
        //img.style.height = img.style.width = "10%"
        img.src = "settings.png"
        tr.appendChild(img)
        table.appendChild(tr)
    }
    tableDiv.appendChild(table)
    tableDiv.style.transform = "translateY(" + -(const1 / 2) + "px)"
    //tableDiv.onkeypress = "keyPress()"
}

var index = 0
var moveRunning = false

function move(moveUp) {
    var div = document.getElementById("menu")
    //div.style.transform = "translateY(" + -(const1 + const2) * ++index + "px)"
    var num = index
    index = (moveUp) ? index + 1 : index - 1
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
            var c1c = -const1/2 -1  * (const1 + const2) * (num = (moveUp) ? num + 0.05 : num - 0.05)
            div.style.transform = "translateY(" + c1c + "px)"
        }
    }, 5)
}

Mousetrap.bind('down', function () {
    if(loadingDone && !moveRunning && index < numElements - 1) 
    {
        moveRunning = true 
        move(true)
    }
})
Mousetrap.bind('up', function () {
    if(loadingDone && !moveRunning && index > 0) 
    {
        moveRunning = true
        move(false)
    }
})
init()