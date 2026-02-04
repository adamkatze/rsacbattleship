

function initGame() {

  //Prevent right clicks
  $(document).on("contextmenu", function(e) {
    e.preventDefault();
  });

  debug = getUrlParameter('debug')

  $('body').attr('data-debug',debug)
  $('body').attr('data-show-timer', showTimer)
  updateGameState('loading')

  //Create the empty grid

  for(let i = 0; i < (blocksPerCategory * categoriesPerGame); i ++) {

    let xpos = (i % blocksPerCategory)
    let ypos = (Math.floor(i / blocksPerCategory))

    let w = (100 / blocksPerCategory)
    let h = (100 / categoriesPerGame)

    let left = xpos * w
    let top =  ypos * h



    $(`<div class="gridBlockWrapper idle" data-category="" data-id="${i}" data-pos="${xpos},${ypos}" 
        style="left: ${left}%; top: ${top}%; width: ${w}%; height: ${h}%;">
         <div class="gridBlock" onclick="toggleBlock(this)">
           <span class="title"></span>
         </div>
      </div>`).appendTo('.gameBlock-Grid')

  }

  //Init the mistakes display
  for (let i = 0; i < triesMax; i++) {
     $(`<div class="tryMarker" data-id="${i}"></div>`).appendTo('.mistakes')
  }

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




function newGame(data) {
  
  updateGameState('loading')

  //Update the timer text to the game max
  updateTimer(gameTime)
  $('.gameTime .label').text('Time left')

  console.log(data)

  //Update the game title string
  currentGameTitle = data.title
  $('.gameTitleMessage').html(`Looks like you're an expert in <br> <strong>${data.title}</strong>`)

  //Generate a random order for positioning the blocks on the grid
  let order = randomOrder(blocksPerCategory * categoriesPerGame)

  let count = 0
  let catCount = 0
  Object.entries(data.categories).forEach(([key, cur]) => {      
     for (let i = 0; i < cur.length; i++) {       
         $(`.gridBlockWrapper[data-id="${order[count]}"]`).attr('data-category',key).attr('data-category-id',catCount)
         $(`.gridBlockWrapper[data-id="${order[count]}"] span.title`).text(cur[i])
         count = count + 1
     }  
     catCount = catCount + 1  
  });

  $('.gridBlockWrapper').removeClass('idle')

  //Reset the mistakes display
  triesRemaining = triesMax 

  //Start the timer
  gameOverFlag = false
  startGameTick()
  updateGameState('playing')
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

  if (gameState == 'idle') {
     $('#newGame').addClass('active')
  } else {
     $('#newGame').removeClass('active')
  }
}





function toggleBlock(el) {
  updateIdle() 

  if ( gameState == 'playing' ) {
    let tar = $(el).closest('.gridBlockWrapper')
    let selCount = $('.gridBlockWrapper.selected').length

    //Toggle the blocks selection state, ignoring clicks if the max amount of blocks are already selected
    if ( $(tar).hasClass('selected') ) {
      $(tar).removeClass('selected')
    } else {
      if ( selCount < blocksPerCategory ) {
        $(tar).addClass('selected')
      }      
    }

    //Check the count again to see if we should show the check selections button
    selCount = $('.gridBlockWrapper.selected').length
    if ( selCount >= blocksPerCategory ) {
      $('#checkSelection').addClass('active')
    } else {
      $('#checkSelection').removeClass('active')
    }
  }

}



//Checks if the current choices are correct
function checkSelection() {
  updateIdle() 
  updateGameState('checking')
  //if correct, animate blocks to top row and show category info
  //if wrong, show wrong state and reduce tries by 1
  //if tries equal zero, end game

  let catToCheck = ''
  let passedCheck = true

  $('.gridBlockWrapper.selected').each(function() {
    if ( catToCheck.length <= 0 ) {
       catToCheck = $(this).attr('data-category')
    } else {
       let curCat = $(this).attr('data-category')
       if (curCat != catToCheck) {
        passedCheck = false
       }
    }
  })

  if (passedCheck) {
    correctAnswer() 
  } else {
    wrongAnswer()
  }

}


function correctAnswer() {
  animatingBlocks = true

  //If this is the last row, stop the timer
  if ( (rowsComplete + 1) >= categoriesPerGame) {
    endGameTick()
  }
  
  $('#checkSelection').removeClass('active')

  let category = ''
  let values = ''
  let id = ''

  //Move correct blocks to the highest open row
  let count = 0
  $('.gridBlockWrapper.selected').each(function() {
      let id_a = $(`.gridBlockWrapper[data-pos="${count},${rowsComplete}"]`).attr('data-id')
      let id_b = $(this).attr('data-id')
      swapBlock(id_a, id_b)

      id = $(this).attr('data-category-id')
      category = $(this).attr('data-category')

      let value = $(this).find('span.title').text().trim()
      values = values + value + ', '
      count = count + 1
  })
  values = values.slice(0, -2);

  //Create the category info block
  let h = (100 / categoriesPerGame)
  let top =  rowsComplete * h

  $(`<div class="categoryInfoWrapper" data-category-id="${id}" style="height: ${h}%; top: ${top}%;">
      <div class="categoryInfo">
        <h3>${category}</h3>
        <p>${values}</p>
      </div>
    </div>`).appendTo('.gameBlock-Grid, .categoryBlockWrapper')


  //Mark these are completed so they cant be selected anymore
   setTimeout(function() {
    $('.gridBlockWrapper.selected').addClass('completed').removeClass('selected')
   }, animSpeed )


  //Show the category info block after animations are done
  setTimeout(function() {
     $('.categoryInfoWrapper').addClass('animIn')
  }, animSpeed * 2)


  //Increase the rows complete flag and allow the user to play again
  setTimeout(function() {   
    rowsComplete = rowsComplete + 1

    if (!gameOverFlag) {      
      if ( rowsComplete >= categoriesPerGame) {
        gameOver()
      } else {
        updateGameState('playing')
      }
    } 
    animatingBlocks = false
    
  }, animSpeed * 3)
  

}

function shakeSelected() {
  $('.gridBlockWrapper.selected').addClass('shake')

  setTimeout(function() {
    $('.gridBlockWrapper.shake').removeClass('shake')
  }, animSpeed)

}

function wrongAnswer() {
  if ( triesRemaining <= 0 ) {
    endGameTick()
  }
  console.log('wrong')
  animatingBlocks = true  

  //Show wrong error here
  shakeSelected()

  //Reduce mistake markers
  triesRemaining = triesRemaining - 1
  updateTryMarkers()

  setTimeout(function() {
      if (!gameOverFlag) {
        if ( triesRemaining <= 0 ) {
          gameOver() 
        } else {
          updateGameState('playing')
        }
      }
      animatingBlocks = false
    }, animSpeed * 2)  
}


function updateTryMarkers() {
  for (let i = 0; i < triesRemaining; i++) {
    $(`.tryMarker[data-id="${i}"]`).addClass('keep')
  }
  $('.tryMarker:not(.keep)').addClass('hide')
  $('.tryMarker').removeClass('keep')
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
  //Give a grade score based on mistakes 
  playerCorrect = rowsComplete
  

  if (!idle) {
    if ( timer <= 0 ) { 
      playerTimeLeft = 0 
    } else {
      playerTimeLeft = timer + 1
    }   

    if ( timer > 0 ) {
      playerGrade = gradeInfo[triesRemaining].grade

      $('.grade').text(playerGrade)
      $('.gradeHeader .icon img').attr('src',gradeInfo[triesRemaining].icon)
      $('.gradeMessage .icon img').attr('src',gradeInfo[triesRemaining].icon2)
      $('.gradeMessage .gradeText').html(`${gradeInfo[triesRemaining].substring} <span class="blue">${currentGameTitle}</span> puzzle.`)
    } else {
      playerGrade = outOfTimeInfo.grade

      $('.grade').text(outOfTimeInfo.string)
      $('.gradeHeader .icon img').attr('src',outOfTimeInfo.icon)
      $('.gradeMessage .icon img').attr('src',outOfTimeInfo.icon2)
      $('.gradeMessage .gradeText').html(`${outOfTimeInfo.substring} <span class="blue">${currentGameTitle}</span> puzzle.`)
    }
  

    $('.gameTime .label').text('Time completed')    

    //Animate mistakes display out and grade in
    animateSwap('.gameMistakes', '.gameScore', animSpeed, animSpeed)   
  }

  //Show Thats a wrap display
  animateSwap('.gameDesc', '.gameOverDesc', animSpeed, 0)  
  

  $('.gridBlockWrapper').removeClass('selected')

  //Shake all unanswered questions
  $('.gridBlockWrapper:not(.completed)').addClass('shake')


  //Show the correct answers for any that arent set
  //Get list of unanswered categories
  $('.gridBlockWrapper:not(.completed)').each(function() {
    let catid = $(this).attr('data-category-id')
    addToUniqueArray(idsRemaining, catid)
  })

  //Animate the remaining unanswered categories
  let endSpeed = (animSpeed * 4)
  for (let i = 0; i < idsRemaining.length; i++) {
    setTimeout(function() {
      $(`.gridBlockWrapper[data-category-id="${idsRemaining[i]}"]`).addClass('selected')
      correctAnswer(true)
    }, (endSpeed * i) + (2 * animSpeed))
  }


  //Wait til animations are done to show the share button
  setTimeout(function() {
    if (!idle) {
      $('#gameOver').addClass('active')
    } else {
      $('div#startOver').addClass('active')
    }
    
  }, (endSpeed * idsRemaining.length) + (3 * animSpeed))

  //If the game was idle, reset the game automatically after idleResetTimer time
  if (idle) {
    setTimeout(function() {
      if (gameState == 'gameover') {
        resetGame()
      }      
    }, (endSpeed * idsRemaining.length) + (idleResetTimer * 1000))
  }

}


function showLeaderboard() {
  updateGameState('loading')
  $('#shareToLeaderboard').removeClass('active')  

  //Display leaderboard data
  setTimeout(function() {
    animIn('.gameInfo')
  },animSpeed)
  
  animateSwap('.gameOver', '.leaderboardWrapper', animSpeed, 0) 

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
     let curGrade = ''
     let curTime = dataSorted[j].time
     
     let gt = parseInt(dataSorted[j].gametime)
     let pt = parseInt(dataSorted[j].time)

     //Formats the grade and times for the leaderboard
     if ( gt - pt > 0 && parseInt(dataSorted[j].triesremaining) > 0 ) {
       curGrade = dataSorted[j].grade     
       curTime = updateTimer(parseInt(dataSorted[j].time),true) 
     } else {
       curGrade = dataSorted[j].correct + '/' + categoriesPerGame
       curTime = '---'
     }


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
      let score = playerCorrect
      if (triesRemaining > 0 && playerTimeLeft > 0) {      
        score = (playerCorrect + playerTimeLeft) * triesRemaining
      }
  
      //Calculate time took
      let playerTime = playerTimeLeft
      if (timeTook) {
        playerTime = gameTime - playerTimeLeft
        if (playerTime < 0) { playerTime = 0 }
      }

      //Send leaderboard info to the server
      let playerData = {
        "fields": "name, correct, grade, time, timestamp, score, triesremaining, gametime",
        "values": [initials, playerCorrect, playerGrade, playerTime, timestamp, score, triesRemaining, gameTime]
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






function showGameOver() {

   $('#gameOver').removeClass('active')

   animOut('.gameInfo', animSpeed)
   animateSwap('.gameWrapper', '.gameOver', animSpeed, 0) 

   setTimeout(function() {
    animOut('.gameOverDesc', animSpeed) 
    $('#shareToLeaderboard').addClass('active')
   }, animSpeed * 2)
}




function resetGame() {
  updateGameState('loading')
  $('#startOver, .gameTitleMessage').removeClass('active')

  if ( $(`.gameOverDesc`).hasClass('animIn') ) {
    animateSwap('.gameOverDesc', '.gameDesc', animSpeed, 0 ) 
  } else {
    animIn('.gameDesc') 
  }
  

  //Remove all the category info blocks
  $('.categoryInfoWrapper').remove()

  //Reset the timer label
  updateTimer(gameTime)
  $('.gameTime .label').text('Time to complete')

  //Reset the tries
  triesRemaining = triesMax 
  rowsComplete = 0
  $('.tryMarker').removeClass('hide')

  //Reset all grid blocks to initial states
  $('.gridBlockWrapper').removeClass('selected completed shake').addClass('idle').attr('data-category-id','').attr('data-category','')
  $('.gridBlock .title').text('')

  //Reset the unanswered categories list
  idsRemaining = []

  //Make the mistakes block visible again
  animateSwap('.gameScore','.gameMistakes', 0, 0)   

  //Make the intials input visibile again
  animateSwap('.leaderboard', '.leaderboardInput', 0, animSpeed) 

  //Show the game board again
  animateSwap('.leaderboardWrapper', '.gameWrapper', animSpeed, 0) 

  //Show the Tap to Play button
  setTimeout(function() {
    $('#newGame').addClass('active')
    $('.gameTitleMessage').removeClass('show')

    $('input#leaderboardInitials').val('')
    $('.leaderboardInput').removeClass('disabled')
  }, animSpeed)
  
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





function addToUniqueArray(array, value) {
  if ($.inArray(value, array) === -1) {
    array.push(value);
  }
}


function swapBlock(id_a, id_b) {
  if ( $(`.gridBlockWrapper[data-id="${id_a}"]`).length > 0 && $(`.gridBlockWrapper[data-id="${id_b}"]`).length > 0 ) { 

      let posA =  $(`.gridBlockWrapper[data-id="${id_a}"]`).attr('data-pos')
      let leftA = $(`.gridBlockWrapper[data-id="${id_a}"]`).prop('style').left;
      let topA =  $(`.gridBlockWrapper[data-id="${id_a}"]`).prop('style').top;

      let posB = $(`.gridBlockWrapper[data-id="${id_b}"]`).attr('data-pos')
      let leftB = $(`.gridBlockWrapper[data-id="${id_b}"]`).prop('style').left;
      let topB =  $(`.gridBlockWrapper[data-id="${id_b}"]`).prop('style').top;

      $(`.gridBlockWrapper[data-id="${id_a}"]`).attr('data-pos',posB).css('left',leftB).css('top',topB)
      $(`.gridBlockWrapper[data-id="${id_b}"]`).attr('data-pos',posA).css('left',leftA).css('top',topA)

  } else {
    console.log('block doesnt exist')
  }  
}



function randomOrder(length) {  
  const numbers = Array.from({ length }, (_, i) => i);

  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  return numbers;
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
                newGame(data.data)
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