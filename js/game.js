window.onload = init;

var timerMatch,
    timerNotMatch,
    timer,
    milTimer,
    isWaiting = false,
    lock = false,
    gameStarted = false,
    allowToggle = false,
    matches = 0,
    faults = 0,
    newSecs = 0,
    newMins = 0,
    newMils = 0,
    animDelay = 0,
    cardsAmount = 36,
    sH = screen.height/4.5,
    sW = screen.width/3,
    cards1 = [],
    cards2 = [],
    sCards = [],
    renewCards = [],
    firstCard = { src: '', id: '' },
    secondCard = { src: '', id: '' },
    output = '',
    timeOutput = '',
    defCard = 'secret.png',
    HTMLstart = document.getElementById('start'),
    HTMLshuffling = document.getElementById('shuffling'),
    HTMLstop = document.getElementById('stop'),
    HTMLtarget = document.getElementById('target'),
    HTMLmatches = document.getElementById('matches'),
    HTMLmatchesMatch = document.getElementById('matches-match');
    HTMLhistory = document.getElementById('history'),
    HTMLhistoryWrap = document.getElementById('history-wrap'),
    HTMLfooter = document.getElementById('footer');
    HTMLtime = document.getElementById('time'),
    HTMLtimeMain = document.getElementById('main'),
    HTMLtimeMili = document.getElementById('mili'),
    HTMLdetails = document.getElementById('details'),
    HTMLclearHistory = document.getElementById('clear-history'),
    shuffleStartAudio = new Audio('/audio/ShuffleCards.mp3');
    shuffleStopAudio = 'will be added here ;)';
    clickFirstAudio = new Audio('/audio/ClickFirst.mp3');
    cardsMatchAudio = new Audio('/audio/MatchAudio.mp3');
    cardsFaultAudio = new Audio('/audio/FaultAudio.mp3');
    detailsSlideAudio = new Audio('/audio/DetailsSlide.mp3');

function init(){
    HTMLdetails.style.opacity = '1';

    for(let x=0 ; x<cardsAmount/2 ; x++){
        cards1.push({src: x+1});
        cards2.push({src: x+1});
    }

    // Merge both arrays and shuffle elements
    sCards = shuffleCards(cards1.concat(cards2));

    // Yup, print cards...
    printCards();

    var hold = localStorage.getItem('history');

    // Initialize local storage if empty
    if(hold === null)
        resetLocalStorate();
        
    else {
        if(hold == '[]'){
            HTMLhistory.innerHTML = '<p class="no-history-available">No history available</p>';
            HTMLclearHistory.style.display = 'none';
        }

        else
            printCollectedData(JSON.parse(hold));
    }

    HTMLstart.addEventListener('click', startGame);
    HTMLstop.addEventListener('click', stopGame);
    HTMLclearHistory.addEventListener('click', clearHistory);
}

function startGame(){
    allowToggle = false;
    toggleHistory(allowToggle);

    // Reset timers and print zeros
    newSecs = 0;
    newMins = 0;
    newMils = 0;
    HTMLtimeMain.innerHTML = '00:00';
    HTMLtimeMili.innerHTML = '0';

    var aC;
    setTimeout(function(){
        for(let x=0 ; x<5 ; x++){
            setTimeout(function(){
                for(let y=0 ; y<cardsAmount ; y++){
                    if(x < 4) aC = animateCards();
                    else { aC[0] = 0; aC[1] = 0; aC[2] = 0; }

                    document.getElementById(y).style.top = `${aC[0]}px`;
                    document.getElementById(y).style.left = `${aC[1]}px`;
                    document.getElementById(y).style.transform = `rotate(${aC[2]}deg)`;
                }

                // Play sound
                shuffleStartAudio.play();
            }, animDelay);

            animDelay += 500;
        }
    
        setTimeout(function(){
            HTMLshuffling.style.display = 'none';
            HTMLstop.innerHTML = 'Stop';
            HTMLstop.style.backgroundColor = '#34495e';
            HTMLstop.style.color = '#ffffff';
            HTMLstop.style.display = 'inline-block';
            runTimer();
            runMilTimer();
            gameStarted = true;
        }, animDelay);

        animDelay = 0;
    }, 400);

    /* DOM manipulation, animations and sounds */
    // History slide up
    detailsSlideAudio.play();
    HTMLhistoryWrap.style.zIndex = '-1';
    HTMLhistoryWrap.style.opacity = '0';
    HTMLhistoryWrap.style.transition = 'opacity .2s, bottom .5s';
    HTMLhistoryWrap.style.bottom = '50px';

    // Footer fade out
    HTMLfooter.style.bottom = '50px';
    HTMLfooter.style.opacity = '0';

    setTimeout(function(){
        HTMLhistoryWrap.style.display = 'none';
        HTMLfooter.style.display = 'none';
    }, 200);

    // Matches
    HTMLmatches.innerHTML = `<h1><span id="matches-match ">${matches}</span>/${cardsAmount/2}</h1>`;
    HTMLmatches.style.display = 'block';
    setTimeout(function(){
        HTMLmatches.style.opacity = '.3';
    }, 260);

    // Change value of "Start" button
    HTMLstart.style.display = 'none';
    HTMLshuffling.innerHTML = 'Shuffling';
    HTMLshuffling.style.backgroundColor = '#34495e';
    HTMLshuffling.style.color = '#ffffff';
    HTMLshuffling.style.display = 'inline-block';
}

function stopGame(){
    allowToggle = true;
    toggleHistory(allowToggle);

    clearTimers();
    collectData(matches, faults, timeOutput);
    printCollectedData(JSON.parse(localStorage.getItem('history')));

    // Reset some values
    if(isWaiting) isWaiting = false;
    gameStarted = false;
    output = '';
    faults = 0;

    // Stop the following sounds if they were currently playing
    cardsMatchAudio.pause();
    cardsFaultAudio.pause();
    cardsMatchAudio.currentTime = 0.0;
    cardsFaultAudio.currentTime = 0.0;

    for(let x=0 ; x<renewCards.length ; x++){
        document.getElementById(renewCards[x]).style.visibility = 'visible';
        document.getElementById(renewCards[x]).style.opacity = '1';
    }

    // Shuffle cards again
    sCards = shuffleCards(cards1.concat(cards2));

    // Shuffle cards animation
    for(let x=0 ; x<cardsAmount ; x++){
        let aC = animateCards();
        document.getElementById(x).style.top = `${aC[0]}px`;
        document.getElementById(x).style.left = `${aC[1]}px`;
        document.getElementById(x).style.transform = `rotate(${aC[2]}deg)`;
        document.getElementById(x).style.backgroundImage = `url(/cards/${defCard})`;
    }

    /* DOM manipulation, animations and sounds */
    // Matches
    HTMLmatches.innerHTML = `<h1><span id="matches-match ">${matches}</span>/${cardsAmount/2}</h1>`;
    HTMLmatches.style.opacity = '0';
    setTimeout(function(){
        HTMLmatches.style.display = 'none';
    }, 500);

    // Show "clear history" button
    HTMLclearHistory.style.display = 'inline-block';

    // Swap Stop and Play buttons
    HTMLstop.style.display = 'none';
    HTMLstart.style.display = 'inline-block';

    // Play sound
    shuffleStartAudio.play();

    // History & Footer slide down
    setTimeout(function(){
        detailsSlideAudio.play();
        HTMLhistoryWrap.style.display = 'block';
        HTMLfooter.style.display = 'block';

        setTimeout(function(){
            // For History
            HTMLhistoryWrap.style.transition = 'opacity 1.2s, bottom .5s';
            HTMLhistoryWrap.style.opacity = '1';
            HTMLhistoryWrap.style.bottom = '0px';
            HTMLhistoryWrap.style.zIndex = '1';

            // For Footer
            HTMLfooter.style.opacity = '1';
            HTMLfooter.style.bottom = '0px';
        }, 20);    

        // Reset matches
        matches = 0;
    }, 400);
}

// In order to achvieve efficient permutation we need to use Fisher-Yates shuffle algorithm
function shuffleCards(cards) {
    var j, x, i;
    for (i=cards.length-1 ; i>0 ; i--){
        j = Math.floor(Math.random() * (i + 1));
        x = cards[i];
        cards[i] = cards[j];
        cards[j] = x;
    }

    return cards;
}

// Get some random parameters to animate cards as they shuffle
function animateCards(){
    var top = Math.floor(Math.random() * (sH - 50) - 50),
        left = Math.floor(Math.random() * (sW - 50) - 50),
        r = Math.floor(Math.random() * (540 - 1) - 1);

    return [top, left, r];
}

// Print cards
function printCards(){
    var inc = 0,
        sqrt = Math.sqrt(cardsAmount);

    for(let row=0 ; row<sqrt ; row++){
        for(let col=0 ; col<sqrt ; col++){
            var aC = animateCards();
            output += `<li
                            class="card"
                            id=${inc}
                            style="background-image:url('/cards/${defCard}');
                            top: ${aC[0]}px;
                            left: ${aC[1]}px;
                            transform: rotate(${aC[2]}deg)"
                            onclick=playCard(id)>
                        </li>`;
            aC[0] += 10;
            inc++;
        }
        aC[1] += 30;
        output += '<br>';
    }

    HTMLtarget.innerHTML = output;
}

// Send collected data to Local Storage
function collectData(m, f, tO){
    dataObj = { "matches": m, "faults": f, "timePlayed": tO };
    let hold = JSON.parse(localStorage.getItem('history'));
    
    hold.unshift(dataObj);

    if(hold.length > 5)
        hold.pop();

    localStorage.setItem('history', JSON.stringify(hold));
}

// Print data from Local Storage previously collected
function printCollectedData(data){
    output = '';
    for(let x=0 ; x<data.length ; x++){
        output += `<tr>
                        <td>${data[x].matches}</td>
                        <td>${data[x].faults}</td>
                        <td>${data[x].timePlayed}</td>
                    </tr>`;
    }

    HTMLhistory.innerHTML = `
        <tr><th>Matches</th><th>Mistakes</th><th>Time played</th></tr>
        ${output}
    `;
}

// Reset Local Storage to empty array
function resetLocalStorate(){
    localStorage.setItem('history', '[]');
    HTMLhistory.innerHTML = '<p class="no-history-available">No history available</p>';
}

function toggleHistory(game){
    console.log(game);
    if(game){
        console.log('Show history');
    }
    else
        console.log('Hide history');
}

function clearHistory(){
    let hold = JSON.parse(localStorage.getItem('history'));
    hold = [];
    localStorage.setItem('history', JSON.stringify(hold));
    location.reload();
}

// Take action when clicked on a card
function playCard(id){
    if(gameStarted){
        if(!lock){
            console.log(matches);
            clickFirstAudio.pause();
            clickFirstAudio.currentTime = 0.0;
            clickFirstAudio.play();
            let getSrc = sCards[id].src;

            // First reveal the cards
            document.getElementById(id).style.transform = 'rotate(35deg)';

            setTimeout(function(){
                document.getElementById(id).style.backgroundImage = `url(/cards/${getSrc}.png)`;
                document.getElementById(id).style.transform = 'rotate(0deg)';
            }, 60);

            // Isn't waiting
            if(!isWaiting){
                firstCard.src = getSrc;
                firstCard.id = id;
                isWaiting = true;
                return;
            }

            // Is waiting
            else {
                secondCard.src = getSrc;
                secondCard.id = id;

                // match
                if(firstCard.src == secondCard.src){
                    if(firstCard.id != secondCard.id){
                        matches++;

                        // These cards need to be renewed later
                        renewCards.push(firstCard.id);
                        renewCards.push(secondCard.id);
                        
                        // If there are no cards left
                        if(matches == cardsAmount/2){
                            // Game over
                            setTimeout(function(){
                                HTMLstop.innerHTML = 'Restart';
                            }, 1000);

                            gameStarted = false;

                            collectData(matches, faults, timeOutput);

                            // Reset faults
                            faults = 0;

                            toggleHistory(gameStarted);
                            clearTimers();
                        }

                        lock = true;
                        timerMatch = setTimeout(function(){

                            // Play audio
                            cardsMatchAudio.play();

                            document.getElementById(firstCard.id).style.transform = 'skew(-0.06turn, 18deg)';
                            document.getElementById(secondCard.id).style.transform = 'skew(-0.06turn, 18deg)';

                            setTimeout(function(){
                                document.getElementById(firstCard.id).style.opacity = '0';
                                document.getElementById(secondCard  .id).style.opacity = '0';
                            }, 30);

                            setTimeout(function(){
                                document.getElementById(firstCard.id).style.visibility = 'hidden';
                                document.getElementById(secondCard.id).style.visibility = 'hidden';

                                // Update matches in HTML
                                HTMLmatches.innerHTML = `<h1><span id="matches-match ">${matches}</span>/${cardsAmount/2}</h1>`;
                            }, 150);
                            
                            lock = false;
                        }, 550);
                    }

                    else return;
                }

                // not match
                else {
                    lock = true;
                    faults++;
                    var fC = document.getElementById(firstCard.id),
                        sC = document.getElementById(secondCard.id);
                    
                    timerNotMatch = setTimeout(function(){
                        fC.style.transform = 'rotate(35deg)';
                        sC.style.transform = 'rotate(35deg)';

                        // Play audio
                        cardsFaultAudio.play();

                        setTimeout(function(){
                            fC.style.backgroundImage = `url(/cards/${defCard})`;
                            sC.style.backgroundImage = `url(/cards/${defCard})`;
                            fC.style.transform = 'rotate(0deg)';
                            sC.style.transform = 'rotate(0deg)';
                        }, 60);
                        
                        lock = false;
                    }, 700);
                }

                isWaiting = false;
            }
        }

        else return;
    }

    else return;
}

function runTimer(){
    timeOutput = '00:00';

    timer = setInterval(function(){
        newSecs++;
        
        if(newSecs < 10)
            newSecs = `0${newSecs}`;

        if(newSecs > 59){
            newSecs = 0;
            newMins++;
        }

        if(newMins == 10)
            clearTimers();

        timeOutput = `0${newMins}:${newSecs}`;
        HTMLtimeMain.innerHTML = timeOutput;
    }, 1000);
}

function runMilTimer(){
    milTimer = setInterval(function(){
        newMils++;

        if(newMils > 9) newMils = 0;
        
        HTMLtimeMili.innerHTML = newMils;
    }, 100);
}

function clearTimers(){
    clearInterval(timer);
    clearInterval(milTimer);
}