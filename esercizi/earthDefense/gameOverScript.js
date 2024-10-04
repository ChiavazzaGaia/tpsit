function startFunction()
{
    const milliseconds = getQueryParamsMilliseconds();
    const seconds = getQueryParamsSeconds();

    document.getElementById("p3").innerHTML = "You held them off for "+ seconds + "." + milliseconds + " seconds";
}

function restartGame()
{
    window.location.href = "mainMenu.htm"
}


function getQueryParamsSeconds() {
    const params = new URLSearchParams(window.location.search);
    return params.get('secondsValue');
}

function getQueryParamsMilliseconds() {
    const params = new URLSearchParams(window.location.search);
    return params.get('millisecondsValue');
}
