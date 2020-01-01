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
    var const1 = 1000
    var int = setInterval(function () 
    {
        if(num > const1)
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

crossAnimation()