var totalLifes = 5;                                        //Lifes of the player, 5 is default

mainNumber = getQueryParamsInput();                             //Gets the value from the previous file
if(mainNumber == 0 || mainNumber == null)                  //Makes a random main number if player didn't input one
{
    mainNumber = Math.floor(Math.random() * 8) + 2;
}

var mainDiv = document.getElementById("mainNumberDiv");
mainDiv.textContent = mainNumber;

var whichGamemode = getQueryParamsGamemode();        //Gets the gamemode number from the last

var isGameOngoing = true;

var intervalCircle;
var intervalCircleAmount = 2000;
var intervalTimer;
function startFunction()
{
    generateHearts();
    intervalCircle = setInterval(generateCircle, intervalCircleAmount);
    intervalTimer = setInterval(doTimer, 1);
}

function generateCircle()                     //Print a new circle
{
    var circleSize = 100;
    var y = Math.floor((Math.random() * (window.innerHeight- circleSize - 10)) + 1) - 40;   //Gets a random y
    var x = Math.floor((Math.random() * (window.innerWidth - circleSize - 10)) + 1)/3;    //Gets a random x (/3 so only in the first third)

    let div = document.createElement("div");            //Creates a new div element
    div.style.position = "absolute";
    div.style.top = `${y}px`;
    div.style.left = `${x}px`;

    document.body.appendChild(div);                     //Add the div to the body

    let img = document.createElement("img");              //Creates the img element
    img.src = "images/asteroid.png";
    img.alt = "IMG NOT LOADED - asteroid";
    img.style.position = "relative";
    img.style.right = "100px";
    img.style.width = "300px";
    img.style.height = "200px";
    div.appendChild(img);                                 //Puts it as a child of div

    let circleNum = createRandomAsteroidNumber();         //Create a random number on it
    let textNode = document.createElement("span");            //Span is an element used to manipulate HTML text more easily (https://www.geeksforgeeks.org/html-span-tag/)
    textNode.textContent = circleNum;
    textNode.style.position = "absolute";           
    textNode.style.top = "46%";                               //Both not perfectly central or it'd look worse
    textNode.style.left = "46%";
    textNode.style.transform = "translate(-50%, -50%)";       //Adjust for centering
    textNode.style.fontSize = "70px";
    textNode.style.color = "black";
    textNode.style.zIndex = "1";
    div.appendChild(textNode);


    div.addEventListener("click", function() {

        if(circleNum % mainNumber != 0)
        {
            const asteroidRect = div.getBoundingClientRect();
            explodeAsteroid(asteroidRect.left, asteroidRect.top);
            totalLifes--;
            heartArray[heartArray.length-1].remove();
            heartArray.pop();

            if(heartArray.length==0)
            {
                gameOver();
            }
        }
        div.remove();
    })


    var randomSpeed;                                    //Creates the speed. 80% 1, 20% 2
    if(Math.random()<0.2){
        randomSpeed = topSpeed;
    }else{
        randomSpeed = lowestSpeed;
    }

    if(isGameOngoing)
    {
        var moveInterval = setInterval(() => moveCircle(div, moveInterval, randomSpeed, circleNum), 10);        //Starts the move circle function
    }

}

function moveCircle(div, moveInterval, speed, circleNum)                   //Move the circle
{

    if (!div || !div.getBoundingClientRect) {
        return; // Skip the rest of the function if the div is not valid
    }

    const divBound = div.getBoundingClientRect()
    var offsetX = parseInt(divBound.left);
    offsetX = offsetX + speed;
    div.style.left = `${offsetX}px`;

    if(!isGameOngoing)                             //Stops the ones still going when the game is over
        clearInterval(moveInterval);

    if(offsetX >= 1500)//Change to match eventual planet
    {
        
        if(circleNum%mainNumber==0)
        {
            const asteroidRect = div.getBoundingClientRect();
            explodeAsteroid(asteroidRect.left, asteroidRect.top);

            totalLifes--;
            heartArray[heartArray.length-1].remove();
            heartArray.pop();

            if(heartArray.length==0)
            {
                gameOver();
            }
        }

        div.remove();
        clearInterval(moveInterval);
    }

}

function createRandomAsteroidNumber()
{
    if(Math.random()>0.8)            //30% of being divisible for sure
    {
        do{

            var randomNum = Math.floor(Math.random() * 100) + 1;

            if(randomNum % mainNumber == 0)
                {
                    return randomNum;
                }

        }while(1==1);

    }else{                         //70% of being truly random

        var randomNum = Math.floor(Math.random() * 100) + 1;
        return randomNum;

    }
}

var heartArray = [];
function generateHearts()
{
    var leftDistance = 10;
    for(let i=0; i<totalLifes; i++)
    {
        let heart = document.createElement("div");
        let heartImg = document.createElement("img");

        heartImg.src = "images/heart.png";
        heartImg.alt = "IMG NOT GENERATED - heart";
        heartImg.style.height = "50px";
        heartImg.style.widows = "50px";
        heartImg.style.position = "absolute";
        heartImg.style.left = `${leftDistance}px`;
        leftDistance += 60;

        heart.appendChild(heartImg);
        document.body.appendChild(heart);
        heartArray.push(heart);
    }
}

var millisecondsPassed=0;
var secondsPassed=0;
function doTimer()
{
    millisecondsPassed++;
    if(millisecondsPassed%100==0 && millisecondsPassed != 0)
    {
        secondsPassed++;
        millisecondsPassed=0;
    }

    if(secondsPassed%10==0 && secondsPassed!=0 && millisecondsPassed==0)
    {
        updateDifficulty();
    }

    document.getElementById("timerH1").innerHTML = secondsPassed+"."+millisecondsPassed;
}

function gameOver()
{

    isGameOngoing = false;
    window.location.href = "gameOverScreen.htm" + 
    "?millisecondsValue=" + encodeURIComponent(millisecondsPassed) +
    "&secondsValue=" + encodeURIComponent(secondsPassed);

}

topSpeed = 2;
lowestSpeed = 1;
var difficultyLevel=1;
function updateDifficulty()
{
    if(whichGamemode==1)
    {
        if (difficultyLevel > 0.7) {
            difficultyLevel -= 0.02;  // Faster decrease in the beginning
        } else if (difficultyLevel > 0.5) {
            difficultyLevel -= 0.01;  // Gradual decrease as it gets harder
        } else if (difficultyLevel > 0.3) {
            difficultyLevel -= 0.005;  // Slower decrease to prevent the game from becoming too hard too quickly
        } else {
            topSpeed = 4;
            lowestSpeed = 3;
        }
        
        clearInterval(intervalCircle);
        intervalCircleAmount = 2000 * Math.pow(difficultyLevel, 2);        //POW is exponent. difficultyLevel ^ 2
        intervalCircleAmount = Math.max(intervalCircleAmount, 500);        //Stops it from going below 500
        intervalCircle = setInterval(generateCircle, intervalCircleAmount);    //Interval to create circles
        
        if(difficultyLevel<0.7)
        {
            topSpeed=4;
            lowestSpeed=3;
        }
        else if(difficultyLevel<0.85)
        {
            topSpeed=3;
            lowestSpeed=2;
        }
        
    }

}

function explodeAsteroid(varLeft, varTop)
{
    const imgExplosion = document.createElement("img");
    imgExplosion.src="images/explosion.png";
    imgExplosion.alt="IMG NOT LOADING - explosion";

    imgExplosion.style.position="absolute";
    imgExplosion.style.left=varLeft+"px";
    imgExplosion.style.top=varTop+"px";
    imgExplosion.style.height=200+"px";
    imgExplosion.style.width=300+"px";

    document.body.appendChild(imgExplosion);

    setTimeout(function() {         //Waits x milliseconds before doing it
        imgExplosion.remove();
    }, 2000);                       //x here is 2000
}


function getQueryParamsInput() {                                        //Get query parameters (syntax found on internet)
    const params = new URLSearchParams(window.location.search);
    return params.get('inputValue');                //Get the value of the 'inputValue' parameter
}

function getQueryParamsGamemode()
{
    const params = new URLSearchParams(window.location.search);
    return params.get('whatGamemode'); 
}