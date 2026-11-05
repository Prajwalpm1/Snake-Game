let board = document.querySelector(".board");
let startBtn = document.querySelector(".btn-start");
let modal = document.querySelector('.modal');
let startgamemodal = document.querySelector('.start-game');
let gameOvermodal = document.querySelector('.game-over');
let gameOverMessage = document.querySelector('.game-over-message');
let restartBtn = document.querySelector('.btn-restart');

let highScoreElement = document.querySelector('#high-score');
let scoreElement = document.querySelector('#score');
let timeElement = document.querySelector('#time');

const blockheight = 50;
const blockwidth = 50;
const blocks = [];
let snake = [
    {x: 1, y: 3},
    
];
let direction = "right";
let intervalId = null
let timeIntervalId = null

let highScore = localStorage.getItem('highScore') || 0;
let score = 0;
let time = 0;

function updateTimeDisplay(){
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timeElement.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer(){
    clearInterval(timeIntervalId);
    timeIntervalId = setInterval(()=>{
        time += 1;
        updateTimeDisplay();
    }, 1000);
}

highScoreElement.innerText = highScore

let cols = Math.floor(board.clientWidth / blockwidth);
let rows = Math.floor(board.clientHeight / blockheight);

let food;

function placeFood(){
    const emptyCells = [];
    for(let row = 0; row < rows; row++){
        for(let col = 0; col < cols; col++){
            if(!snake.some(segment => segment.x === row && segment.y === col)){
                emptyCells.push({x: row, y: col});
            }
        }
    }
    if(emptyCells.length === 0) return null;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

food = placeFood();



for(let row = 0; row<rows; row++){
    for(let col = 0; col<cols; col++){
        const block = document.createElement("div");
        block.classList.add("block");
        board.appendChild(block);
        // block.innerText = `${row}-${col}`;
        blocks[`${row}-${col}`] = block;
        
    }
}
if(food) blocks[`${food.x}-${food.y}`].classList.add("food");

function render(){
    let head = null;

    if(direction === "left"){
        head = {x:snake[0].x,y:snake[0].y-1}
    }
    else if(direction === "right"){
        head = {x:snake[0].x,y:snake[0].y+1}
    }
    else if(direction === "up"){
        head = {x:snake[0].x-1,y:snake[0].y}
    }else if(direction === "down"){
        head = {x:snake[0].x+1,y:snake[0].y}
    }

    const eatingFood = food && head.x === food.x && head.y === food.y;

    const hitsWall = head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols;
    // The tail moves away on this tick unless the snake is eating and growing.
    const hitsSelf = snake.some((segment, index) => {
        const isVacatingTail = index === snake.length - 1 && !eatingFood;
        return !isVacatingTail && segment.x === head.x && segment.y === head.y;
    });

    if(hitsWall || hitsSelf){
        clearInterval(intervalId)
        clearInterval(timeIntervalId)
        gameOverMessage.innerText = hitsSelf ? 'The Snake Hit Its Own Body!' : 'Game is Over';
        modal.style.display = 'flex';
        startgamemodal.style.display = 'none'
        gameOvermodal.style.display = 'flex';
        return;

    }

    if(eatingFood){
        blocks[`${food.x}-${food.y}`].classList.remove("food");
        score += 10;
        scoreElement.innerText = score;
        if(score > highScore){
            highScore = score;
            localStorage.setItem('highScore', highScore.toString());
            highScoreElement.innerText = highScore;
        }
        food = placeFood();
        if(food) blocks[`${food.x}-${food.y}`].classList.add("food");
    }

    snake.forEach(segment =>{
       blocks[`${segment.x}-${segment.y}`].classList.remove("fill", "snake-head")
    })
    snake.unshift(head)
    if(!eatingFood) snake.pop()
   

    snake.forEach((segment, index) =>{
       blocks[`${segment.x}-${segment.y}`].classList.add(index === 0 ? "snake-head" : "fill")
    })
}


restartBtn.addEventListener('click',restartGame)

startBtn.addEventListener('click',()=>{
    modal.style.display = 'none'
    intervalId = setInterval(()=>{
        render()
    }, 300) 
    startTimer();
})

function restartGame(){
    clearInterval(intervalId);
    clearInterval(timeIntervalId);
    direction = "down"
    if(food) blocks[`${food.x}-${food.y}`].classList.remove("food")
    snake.forEach(segment =>{
       blocks[`${segment.x}-${segment.y}`].classList.remove("fill", "snake-head")
    })

    score = 0
    time = 0
    scoreElement.innerText = 0
    updateTimeDisplay();

 modal.style.display = 'none'
 snake = [{x: 1, y: 3},]
    food = placeFood()
    if(food) blocks[`${food.x}-${food.y}`].classList.add("food")
     intervalId = setInterval(()=>{
        render()
    }, 300)   
    startTimer();


}


function changeDirection(newDirection){
    // Prevent an immediate 180-degree turn into the snake's own body.
    const oppositeDirections = {
        left: "right",
        right: "left",
        up: "down",
        down: "up"
    };
    if(newDirection !== oppositeDirections[direction]){
        direction = newDirection;
    }
}

addEventListener('keydown', (ev) => {
    const keyDirections = {
        ArrowDown: "down",
        ArrowUp: "up",
        ArrowRight: "right",
        ArrowLeft: "left"
    };
    if(keyDirections[ev.key]){
        ev.preventDefault();
        changeDirection(keyDirections[ev.key]);
    }
});

let swipeStartX = 0;
let swipeStartY = 0;

board.addEventListener('touchstart', (ev) => {
    const touch = ev.changedTouches[0];
    swipeStartX = touch.clientX;
    swipeStartY = touch.clientY;
}, { passive: true });

board.addEventListener('touchend', (ev) => {
    const touch = ev.changedTouches[0];
    const deltaX = touch.clientX - swipeStartX;
    const deltaY = touch.clientY - swipeStartY;
    const minimumSwipe = 20;

    if(Math.max(Math.abs(deltaX), Math.abs(deltaY)) < minimumSwipe) return;

    if(Math.abs(deltaX) > Math.abs(deltaY)){
        changeDirection(deltaX > 0 ? "right" : "left");
    }else{
        changeDirection(deltaY > 0 ? "down" : "up");
    }
}, { passive: true });
