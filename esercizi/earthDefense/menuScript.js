function startGame()
{
    const input = document.getElementById("inputID").value;
    window.location.href = "earthDefense.htm" + 
    "?inputValue=" + encodeURIComponent(input) +
    "&whatGamemode=" + encodeURIComponent(chosenGamemode);   //Opens up another file and sends the value using a "query parameter". ? on first and & on subsequent
}

function startTutorial()
{
    window.location.href = "tutorial.htm"
}

var chosenGamemode = 1;
function chooseGamemode(num)
{
    chosenGamemode = num;
}