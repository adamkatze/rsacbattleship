

function initGame() {

  //Prevent right clicks
  $(document).on("contextmenu", function(e) {
    e.preventDefault();
  });

  debug = getUrlParameter('debug')
  showAdjacentCount = getUrlParameter('showAdjacent')

  $('body').attr('data-debug',debug)
  $('body').attr('data-show-timer', showTimer)
  updateGameState('loading')

  $('body').attr('data-show-adjacent',showAdjacentCount)
  

  //Init the on screen keyboard
  $('#leaderboardInitials').keyboard({
    layout: 'alpha-numeric-only',
    usePreview : false,
    maxLength : 3,
    initialFocus : false,
    stayOpen : true,
    appendTo : '.leaderboardInput-Inner',
  });
  showKeyboard()

  //Set the timer text to the game max
  updateTimer(gameTime)

  updateGameState('idle')

  scaleElements()
}




function newGame() {
  
  updateGameState('loading')

  //Update the timer text to the game max
  updateTimer(gameTime)
  $('.gameTime .label').text('Time left')

  //Reset game variables
  currentLevel = 1
  aiActive = false
  playerScore = 0
  triesRemaining = triesMax 

  addFeedLine('New game started')

  //Load the game tab
  animateSwap('.homeWrapper', '.gameWrapper', 0, animSpeed) 

  //Init the game
  initGameLevel()

  //Start the timer
  gameOverFlag = false
  startGameTick()
  updateGameState('playing')
}





function initGameLevel() {
  $('.gameBlock-Grid').html('')
  triesMax = correctPerLevel[currentLevel - 1]
  triesRemaining = triesMax
  updateTries()
  updateAIActiveBar() 

  //Create the empty grid
  let blockWidth = $('.gameBlock-Grid').width() / gridWidth

  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      let block = $(`<div class="gameBlock" 
              style="width:${blockWidth}px;height:${blockWidth}px; top:${i * blockWidth}px; left:${j * blockWidth}px;" 
              data-row="${i}" 
              data-col="${j}" 
              data-count="${(i * gridWidth) + j}" 
              data-id="${j},${i}"
              onclick="handleBlockClick(this)">
          <div class="dot"></div>
        </div>`)
      $('.gameBlock-Grid').append(block)
    }
  }

  //Make random gameBlocks correct based on currentLevel and correctPerLevel
  //Chose random numbers between 0 and (gridHeight * gridWidth) - 1
  let correctCount = correctPerLevel[currentLevel - 1]

  threatsRemaining = correctCount
  updateThreats()

  let correctBlocks = []   
  while (correctBlocks.length < correctCount) {
    let randNum = Math.floor(Math.random() * (gridHeight * gridWidth))  
    if ( correctBlocks.indexOf(randNum) === -1 ) {  
      correctBlocks.push(randNum)
      $(`.gameBlock[data-count="${randNum}"]`).addClass('correct')
    }     
  }

  //Determine the number of adjacent correct blocks for every non-correct block and save that number in the data-count attribute
  if (showAdjacentCount) {
    $('.gameBlock').not('.correct').each(function() {
      let row = parseInt($(this).attr('data-row'))
      let col = parseInt($(this).attr('data-col'))
      let count = 0 
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (row + i >= 0 && row + i < gridHeight && col + j >= 0 && col + j < gridWidth) {
            if ($(`.gameBlock[data-row="${row + i}"][data-col="${col + j}"]`).hasClass('correct')) {
              count++
            } 
          }
        }
      } 
      $(this).attr('data-count', count)
      $(this).find('.dot').html(`<span class="count">${count}</span>`)
    })
  }


  //If ai is active, show the ai scanner graphic
  if (aiActive) {
    console.log('ai active this level') 

    animIn('.aiScan-Modal', animSpeed)
    setTimeout(function() {
      animOut('.aiScan-Modal', animSpeed)
      for (let i = 0; i < overlaysPerLevel[currentLevel - 1]; i++) {
        createAIOverlay()
      }
    }, aiScanModalTimer + animSpeed)
  }

  //If were on the last level, show the final message
  if (currentLevel == maxLevels) {
    addFeedLine('Final Threats Detected. Eliminate all remaining threats to win.')
    $('body').attr('data-final-level', true)
  }

}

function createAIOverlay(overlaySize) {
  //If no overlaySize defined, use the overlayPrecisionPerLevel grid blocks
  let size = overlaySize
  if (size === undefined) {
    size = overlayPrecisionPerLevel[currentLevel - 1]
  }

  console.log('overlay size: ' + size)

  //Choose a two correct blocks that dont already have an ai overlay to base the overlay around
  let correctBlocks = $('.gameBlock.correct:not(.aiOverlayed)')

  //Return if there are no correct blocks available
  if (correctBlocks.length == 0) {
    console.log('no correct blocks available for overlay')
    return
  }

  let baseBlockIndex = Math.floor(Math.random() * correctBlocks.length)
  let baseBlock = $(correctBlocks[baseBlockIndex])    
  let baseRow = parseInt(baseBlock.attr('data-row'))
  let baseCol = parseInt(baseBlock.attr('data-col'))  



  //Calculate the overlay position
  let overlayTop = (baseRow - Math.floor(size / 2)) * ( $('.gameBlock-Grid').width() / gridWidth )
  let overlayLeft = (baseCol - Math.floor(size / 2)) * ( $('.gameBlock-Grid').width() / gridWidth ) 
  if (overlayTop < 0) { overlayTop = 0 }
  if (overlayLeft < 0) { overlayLeft = 0 }
  if (overlayTop + (size * ($('.gameBlock-Grid').width() / gridWidth)) > $('.gameBlock-Grid').height() ) {
    overlayTop = $('.gameBlock-Grid').height() - (size * ($('.gameBlock-Grid').width() / gridWidth))
  }
  if (overlayLeft + (size * ($('.gameBlock-Grid').width() / gridWidth)) > $('.gameBlock-Grid').width() ) {
    overlayLeft = $('.gameBlock-Grid').width() - (size * ($('.gameBlock-Grid').width() / gridWidth))
  }

  //If the overlay would cover an existing overlay, try again with a smaller size
  let overlap = false 
  $('.aiOverlay').each(function() {
    let oTop = parseInt($(this).css('top'))
    let oLeft = parseInt($(this).css('left'))
    let oSize = parseInt($(this).attr('data-size'))
    if ( !( overlayLeft + (size * ($('.gameBlock-Grid').width() / gridWidth)) <= oLeft ||
            overlayLeft >= oLeft + (oSize * ($('.gameBlock-Grid').width() / gridWidth)) ||
            overlayTop + (size * ($('.gameBlock-Grid').width() / gridWidth)) <= oTop || 
            overlayTop >= oTop + (oSize * ($('.gameBlock-Grid').width() / gridWidth)) ) ) {
      overlap = true
    }
  })

  if (overlap) {
    console.log('overlay overlap detected, trying again')
    if (size > 1) {
      size--
      createAIOverlay(size)
    }
    return
  }


  //Create the overlay element
  let overlay = $(`<div class="aiOverlay"
                style="width:${size * ( $('.gameBlock-Grid').width() / gridWidth )}px; height:${size * ( $('.gameBlock-Grid').width() / gridWidth )}px; top:${overlayTop}px; left:${overlayLeft}px;" 
                data-size="${size}">
                <div class="aiOverlay-Inner">
                  <div class="graphic">
                    <img src="../images/icon_alert.png">
                  </div>
                  <div class="text">Investigate here</div>
                </div>


              </div>`)
  $('.gameBlock-Grid').append(overlay)

  //Add a class to any correct blocks within the overlay
  $('.gameBlock.correct').each(function() {
    let blockRow = parseInt($(this).attr('data-row'))
    let blockCol = parseInt($(this).attr('data-col'))
    if ( blockRow >= (overlayTop / ( $('.gameBlock-Grid').width() / gridWidth )) &&
         blockRow < (overlayTop + (size * ($('.gameBlock-Grid').width() / gridWidth))) / ( $('.gameBlock-Grid').width() / gridWidth ) &&
         blockCol >= (overlayLeft / ( $('.gameBlock-Grid').width() / gridWidth )) &&
         blockCol < (overlayLeft + (size * ($('.gameBlock-Grid').width() / gridWidth))) / ( $('.gameBlock-Grid').width() / gridWidth ) ) {
      $(this).addClass('aiOverlayed')
    }
  })

}




function nextLevel() {
  $('body').attr('data-game-state','animating')
  animOut('.gameBlock-Grid', 0)

  setTimeout(function() { 
    initGameLevel()
    addFeedLine('New threats detected. Level ' + currentLevel)
    animIn('.gameBlock-Grid', animSpeed)
  }, animSpeed + 10)  

  setTimeout(function() { 
    $('body').attr('data-game-state','playing')
  }, (animSpeed * 2) + 10)


}

function updateAIActiveBar() {
  if (currentLevel <= aiLevelStart) { 
    $(`.aiActiveBar .bar`).text(`${currentLevel} / ${aiLevelStart} Turns until AI Active`)
  } else {
    aiActive = true
    $('.aiStatusBar').text('AI AGENT STATUS: Scanning for Threats')
    $(`.aiActiveBar .bar`).text(`${currentLevel - aiLevelStart} / ${maxLevels - aiLevelStart} AI Active`)
  }
}



function addFeedLine(text) {
  let timeStamp = new Date();
  //Convert timeStamp to HH:MM:SS format  
  let timeString = timeStamp.toTimeString().split(' ')[0];
  
  let newLine = $(`<div class="feedLine">[${timeString}] ${text}</div>`)

  let curLines = $('.feedLine').length
  if ( curLines >= maxFeedLines ) {
    $('.feedLine').first().remove()
  }     
  $('.aiFeed').append(newLine)
}




function updateTries() {
  $('.triesRemaining .value').text(`${triesRemaining} / ${triesMax}`)
}

function updateThreats() {
  $('.threatsRemaining .value').text(`${threatsRemaining} / ${correctPerLevel[currentLevel-1]}`)
}



function updateTimer(timer,format,reverse) {

  if (reverse) {
    timer = gameTime - timer
  }

  let minutes = Math.floor(timer / 60);
  let seconds = timer % 60;

  minutes = minutes < 10 ? minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;  



  if (format) {
    return `${minutes}:${seconds}`
  } else {
    $('.gameTime .time').text(`${minutes}:${seconds}`)
  }
}

function updateIdle() {
  lastInteraction = Date.now();
}

function checkIdle() {
  let now = Date.now();

  //console.log(now - lastInteraction)

  if (now - lastInteraction > (idleTimer * 1000)) {
    console.log('were idle')
    return true
  } else {
    return false
  }
}


function startGameTick() {
  timer = gameTime

  updateTimer(timer)
  updateIdle() 

  gameTick = setInterval(function() {  
     
    updateTimer(timer)     
     if (--timer < 0) {
        gameOver()
     }
     if ( checkIdle() ) {
      gameOver(true)
     }

  }, 1000)
}

function endGameTick() {
    clearInterval(gameTick);
}




function updateGameState(state) {
  gameState = state
  $('body').attr('data-game-state',gameState)
}



function gameOver(idle) {
  gameOverFlag = true
  endGameTick()
  updateGameState('gameover')

  //Wait for animations to complete before doing actual game over
  let animWatch = setInterval(function() {
    if ( !animatingBlocks ) {
      clearInterval(animWatch )
      gameOverScreen(idle) 
    }
  }, 100)
  
}

function gameOverScreen(idle) {

  console.log('game over')

  //Set analytics values
  

  //Show Thats a wrap display
  animateSwap('.gameDesc', '.gameOverDesc', animSpeed, 0)   

  //Show the game over modal
  animIn('.gameOver-Modal', animSpeed)


  //If the game was idle, reset the game automatically after idleResetTimer time
  if (idle) {
    setTimeout(function() {
      if (gameState == 'gameover') {
        resetGame()
      }      
    }, idleResetTimer * 1000)
  }

}


function showGameOver() {

   $('#gameOver').removeClass('active')

   animOut('.gameInfo', animSpeed)
   animateSwap('.gameWrapper', '.gameOver', animSpeed, 0) 

   setTimeout(function() {
    animOut('.gameOverDesc', animSpeed) 
    $('#shareToLeaderboard').addClass('active')
   }, animSpeed * 2)
}




function showLeaderboard() {
  updateGameState('loading')
  $('#shareToLeaderboard').removeClass('active')  

  //Display leaderboard data
  setTimeout(function() {
    animIn('.gameInfo')
  },animSpeed)
  
  let curActive = $('.gameTab.animIn')
  animateSwap(curActive, '.leaderboardWrapper', animSpeed, 0) 
  //animIn('.leaderboard', 0)

  updateGameState('leaderboard')
}




function drawLeaderboard(data) {
  var lbRowMax = 10
  $('.leaderboard').html('')

  if (data.length < lbRowMax) { lbRowMax = data.length }

  let dataSorted = data
  dataSorted.sort(function(a, b) {
    return parseInt(b.score) - parseInt(a.score);
  }); 

  console.log(dataSorted)

  $(`<div class="lbRow header">
    <div class="lbRow_Rank lbCol">Rank</div>
    <div class="lbRow_Name lbCol">Name</div>
    <div class="lbRow_Grade lbCol">Grade</div>
    <div class="lbRow_Time lbCol">Time</div>
  </div>
  <div class="lbTable"></div>`).appendTo('.leaderboard')

  for (let j = 0; j < lbRowMax; j++) {
     let curGrade = dataSorted[j].score
     let curTime = dataSorted[j].time
     
     let gt = parseInt(dataSorted[j].gametime)
     let pt = parseInt(dataSorted[j].time)

     


    $(`<div class="lbRow">
      <div class="lbRow_Rank lbCol">${j + 1}</div>
      <div class="lbRow_Name lbCol">${dataSorted[j].name}</div>
      <div class="lbRow_Grade lbCol">${curGrade}</div>
      <div class="lbRow_Time lbCol">${curTime}</div>
    </div>`).appendTo('.lbTable')
  }

  //animIn('.leaderboard', animSpeed)
  animateSwap('.leaderboardInput', '.leaderboard', animSpeed, 0) 

  setTimeout(function() {
    $('#startOver').addClass('active')
  }, animSpeed * 3)
  
}




function addToLeaderboard() {

   let initials = $('input#leaderboardInitials').val()
   let timestamp = Date.now();

   

   //Add player score to database and leaderboard if input is not blank
   if ( initials.length > 0) {

      //Generate the sort score
      let score = playerScore
       


      //Send leaderboard info to the server
      let playerData = {
        "fields": "name, grade, timestamp, score, gametime",
        "values": [initials, playerGrade, timestamp, score, gameTime]
      }
      sendCommand('addToLeaderboard',playerData)

      //Disable and hide the input
      $('.leaderboardInput').addClass('disabled')

      //Draw the leaderboard showing the users position 
      getDatabase('drawLeaderboard', '/leaderboard')
   }
}

function skipToLeaderboard() {
   animOut('.leaderboardInput', animSpeed)
   getDatabase('drawLeaderboard', '/leaderboard')
}











function resetGame() {
  updateGameState('loading')
  $('#startOver, .gameTitleMessage').removeClass('active')

  


  //Reset the timer label
  updateTimer(gameTime)
  $('.gameWrapper .gameTime .label').text('Time to complete')

  //unset the final level styling
  $('body').attr('data-final-level', false)

  //Reset the tries
  triesRemaining = triesMax 

  //Hide the game over modal
  animOut('.gameOver-Modal', 0)

  //Make the intials input visbile again
  animateSwap('.leaderboard', '.leaderboardInput', 0, animSpeed) 

  //Show the game board again
  let curActive = $('.gameTab.animIn')
  animateSwap(curActive, '.homeWrapper', animSpeed, 0) 

  $('input#leaderboardInitials').val('')
  $('.leaderboardInput').removeClass('disabled')
  
}




function handleBlockClick(el) {  

  updateIdle()

  if ($(el).hasClass('correct') && !$(el).hasClass('clicked')) {
    addFeedLine('Threat Neutralized at [' + $(el).attr('data-id') + ']')
    playerScore = playerScore + 1
    updateScore()

    triesRemaining--
    updateTries()

    threatsRemaining--
    updateThreats()

    if (threatsRemaining <= 0 || triesRemaining <= 0) {
      if (currentLevel < maxLevels) {
        currentLevel++
        nextLevel()
      } else {
        gameOver()
      }
    }
  } else if (!$(el).hasClass('clicked')) {
    triesRemaining--
    addFeedLine('Missed Threat at [' + $(el).attr('data-id') + ']. Tries remaining: ' + triesRemaining)
    updateTries()

    if (triesRemaining <= 0) {
      if (currentLevel < maxLevels) {
        currentLevel++
        nextLevel()
      } else {
        gameOver()
      }
    }
  }

  $(el).addClass('clicked')

}

function updateScore() {
  $('.gameStats .value').text(playerScore)
}




/*----------------------------------------------------------------------------------------- */
/*------------------------------Helper Functions--------------------------------------------*/
/*----------------------------------------------------------------------------------------- */
//Animates the swap between two elements that are in the same position
function animateSwap(el_a, el_b, speed, delay) {

  setTimeout(function() {
    animOut(el_a, speed) 
  }, delay)

  setTimeout(function() {
    animIn(el_b) 
  }, delay + speed + 10)
}

function animOut(el, speed) {  
  $(el).removeClass('animIn') 
  setTimeout(function() {
    $(el).addClass('hide')
  }, speed)  
}

function animIn(el) {  
    $(el).removeClass('hide')
    setTimeout(function() {
      $(el).addClass('animIn')
    }, 1)
  
}










function getDatabase(action, url) {

  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function() {
      if (xhr.status === 200) {
          const responseData = JSON.parse(xhr.responseText);
          if (action == 'log') {
              console.log(responseData);
          }
          if ( action == 'drawLeaderboard' ) {
             drawLeaderboard(responseData)
          }       
          if ( action == 'drawLBTool' ) {
            drawLeaderboardTool(responseData, url)
        }
      } else {  console.error('Request failed. Status:', xhr.status); }
  };
  xhr.onerror = function() { console.error('Request failed. Network error.'); };
  xhr.send();
}


function showKeyboard() {  
  $('#leaderboardInitials').getkeyboard().reveal();
}

function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  const param = urlParams.get(name);
  return param !== null ? param : false;
}

function scaleElements() {
  scaleToFit('app-wrapper','game', true)
}

function scaleToFit(targetID, parentID, portrait) {
  const baseWidth = portrait ? 1080 : 1920;
  const baseHeight = portrait ? 1920: 1080;

  var parent = document.getElementById(parentID); 

  const parentWidth = parent.clientWidth;
  const parentHeight = parent.clientHeight;

  const scaleX = parentWidth / baseWidth;
  const scaleY = parentHeight / baseHeight;
  const scale = Math.min(scaleX, scaleY);

  const wrapper = document.getElementById(targetID);
  wrapper.style.transform = `scale(${scale})`;

  const offsetX = (parentWidth - baseWidth * scale) / 2;
  const offsetY = (parentHeight - baseHeight * scale) / 2;
  wrapper.style.left = `${offsetX}px`;
  wrapper.style.top = `${offsetY}px`;

    window.addEventListener('resize', scaleElements);
    window.addEventListener('load', scaleElements);
}




/*----------------------------------------------------------------------------------------- */
/*-----------------------------WebSockets---------------------------------------------------*/
/*----------------------------------------------------------------------------------------- */

const socket = io();


function sendCommand(command,data) {
   let message = {
      "action":command,
      "id": socket.id,
      "data":data
   }
   socket.emit('message', message);     
}


function initSockets() {

        //Handle websocket messages
        

        //Handle socket messages
        socket.on('message', (data) => {          
            if (data.id == socket.id) {
              console.log('Received message:', data);    

              if ( data.action == "newGame") {
                console.log('initializing new game')
                newGame()
              }
            }
        })
    
        //On page load, request current game data from server
        let message = {
          "action":"reload",
        }
        socket.emit('message', message);     
}






//---------------LB Tool----------------------------------

function initLBTool() {
  console.log('init')
}

function drawLeaderboardTool(data,table) {

  console.log(data)

  $('.lbTable-Wrapper').html('')

  //Save all this data to tables array
  let index = tables.length
  tables[index] = data


  const allKeys = [...new Set(data.flatMap(obj => Object.keys(obj)))];

  let header = `<tr class="lbTable-Row lbTable-Header">`
  for (let i = 0; i < allKeys.length; i++) {
      header = header + `<td class="lbTable-Col" data-key="${allKeys[i]}">${allKeys[i]}</td>`
  }
  header = header + `<td class="lbTable-Col-Update" data-key="update">update</div></tr>`

  let rows = `<div class="lbTable-Wrapper" data-table-id="${index}">
                  <div class="lbTable-Conrtols">
                      <button class="export" onclick="exportAsCSV(${index})">Export</button>
                  </div>
                  <table class="lbTable" data-table="${table}"> 
                  ${header}`
  for (let i = 0; i < data.length; i++) {

      let cur = data[i]
      let newRow = `<tr class="lbTable-Row">`

      Object.entries(cur).forEach(([key, value]) => {
          newRow = newRow + `<td class="lbTable-Col" data-key="${key}">
                                  <input type="text" value="${value}">                                   
                              </td>`
      });

      newRow = newRow + `<td class="lbTable-Col-Update" data-key="update"><button type="" onclick="updateRow(this)">Update Row</button></tr>`

      rows = rows + newRow

  }
  rows = rows + `</table></div>`

  $('.lbOutput').append(rows)

  $('td.lbTable-Col[data-key="id"] input').attr('disabled',true)

  $('body').removeClass('updateBeforeExport')
}




function exportAsCSV(index) {

  const jsonArray = tables[index]

  // Convert to CSV
  const keys = Object.keys(jsonArray[0]);
  const csvRows = [
  keys.join(','), // header row
  ...jsonArray.map(obj => keys.map(key => JSON.stringify(obj[key] ?? '')).join(','))
  ];

  const csvString = csvRows.join('\n');

  // Trigger download in browser
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.csv';
  a.click();
  URL.revokeObjectURL(url); // Clean up

}

function updateRow(el) {

  $('body').addClass('updateBeforeExport')

  let fields = ``
  let values = []
  let table = $('table.lbTable').attr('data-table')

  $(el).closest('tr.lbTable-Row').find('td.lbTable-Col').each(function() {

      fields = fields + $(this).attr('data-key') + ','
      values.push($(this).find('input').val())

  })
  fields = fields.slice(0, -1)

  
  let playerData = {
      "table": table,
      "fields": fields,
      "values": values
  }
  console.log(playerData)
  sendCommand('addToTable', playerData)

}