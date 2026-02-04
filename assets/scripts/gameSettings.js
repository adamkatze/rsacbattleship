/*-------------Game Variables---------------------- */
var debug = false  //Turns on colored borders for the categories to see correct answers easier

const gridAspect = 9/16;  //Aspect ratio of the gameplay grid blocks

const blocksPerCategory = 4  //Cols in the gameplay grid
const categoriesPerGame = 4  //Rows in the gameplay grid


//Amount of tries the player gets before ending the game
const triesMax = 4

//Transition times for all animations
const animSpeed = 500

const showTimer = false  //If true, the game has a timer that counts down and ends the game if it runs out
const gameTime = 3600  //game timer in seconds
const idleTimer = 60    //Time in seconds without interactions that the game will reset
const idleResetTimer = 10 //Time after an idle game over to auto reset the game



//If true, saves the time the user took to finish the game
//If false, saves the time remaining on the countdown clock at the end of the game
const timeTook = true






var gameState = 'idle'
var gameOverFlag = true
var triesRemaining = triesMax 

var rowsComplete = 0

var idsRemaining = []

var gameTick
var timer

var animatingBlocks = false

var playerGrade
var playerCorrect
var playerTimeLeft

var currentGameTitle

var lastInteraction





const gradeInfo = [
    {
        "grade":"Next time!",
        "string":"Next time!",
        "substring":"Better luck next time on the",
        "icon":"../images/__icon_nexttime.png",
        "icon2":"../images/__icon_rewind.png",
    },
    {
        "grade":"Okay",
        "string":"Next time!",
        "substring":"Better luck next time on the",
        "icon":"../images/__icon_nexttime.png",
        "icon2":"../images/__icon_rewind.png",
    },
    {
        "grade":"Good",
        "string":"Next time!",
        "substring":"Better luck next time on the",
        "icon":"../images/__icon_nexttime.png",
        "icon2":"../images/__icon_rewind.png",
    },
    {
        "grade":"Great!",
        "string":"Next time!",
        "substring":"Better luck next time on the",
        "icon":"../images/__icon_nexttime.png",
        "icon2":"../images/__icon_rewind.png",
    },
    {
        "grade":"Perfect!",
        "string":"Perfect!",
        "substring":"Congrats! You got a perfect on the",
        "icon":"../images/__icon_star.png",
        "icon2":"../images/__icon_trophy.png",
    },
]

const outOfTimeInfo = {
    "grade":"Out of time!",
    "string":"Out of time!",
    "substring":"Better luck next time on the",
    "icon":"../images/__icon_outoftime.png",
    "icon2":"../images/__icon_rewind.png",
}



//Layout for the onscreen keyboard
$.keyboard.layouts['alpha-numeric-only'] = {
  'default': [
    '1 2 3 4 5 6 7 8 9 0 {bksp}',
    'Q W E R T Y U I O P',
    'A S D F G H J K L',
    'Z X C V B N M'
  ]
};

/*-------------------------------------------------- */