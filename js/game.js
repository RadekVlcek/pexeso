window.onload = init;

var timerMatch,
    timerNotMatch,
    timer,
    milTimer,
    isWaiting = false,
    lock = false,
    gameStarted = false,
    matches = 0,
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
    firstCard = { src: '', id: '' },
    secondCard = { src: '', id: '' },
    output = '',
    defCard = 'secret.png',
    HTMLstart = document.getElementById('start'),
    HTMLshuffling = document.getElementById('shuffling'),
    HTMLstop = document.getElementById('stop'),
    HTMLtarget = document.getElementById('target'),
    HTMLtime = document.getElementById('time'),
    HTMLtimeMain = document.getElementById('main'),
    HTMLtimeMili = document.getElementById('mili');
    HTMLdetails = document.getElementById('details');

function init(){
    for(let x=0 ; x<cardsAmount/2 ; x++){
        cards1.push({src: x+1});
        cards2.push({src: x+1});
    }

    // Merge both arrays and shuffle elements
    sCards = shuffleCards(cards1.concat(cards2));

    printCards();

    HTMLstart.addEventListener('click', startGame);
    HTMLstop.addEventListener('click', stopGame);
}

// Run both timers
function startGame(){
    HTMLstart.style.display = 'none';
    HTMLshuffling.innerHTML = 'Shuffling';
    HTMLshuffling.style.backgroundColor = '#34495e';
    HTMLshuffling.style.color = '#ffffff';
    HTMLshuffling.style.display = 'inline-block';
    gameStarted = true;
    var aC;

    // Reset timer values
    newSecs = 0;
    newMins = 0;
    newMils = 0;
    HTMLtimeMain.innerHTML = `0${newMins}:0${newSecs}`;
    HTMLtimeMili.innerHTML = newMils;
    
    for(let x=0 ; x<5 ; x++){
        setTimeout(function(){
            for(let y=0 ; y<cardsAmount ; y++){
                if(x < 4)
                    aC = animateCards();

                else {
                    aC[0] = 0;
                    aC[1] = 0;
                    aC[2] = 0; 
                }

                document.getElementById(y).style.top = `${aC[0]}px`;
                document.getElementById(y).style.left = `${aC[1]}px`;
                document.getElementById(y).style.transform = `rotate(${aC[2]}deg)`;
            }
        }, animDelay);

        animDelay += 500;
    }

    setTimeout(function(){
        HTMLshuffling.style.display = 'none';
        HTMLstop.style.backgroundColor = '#34495e';
        HTMLstop.style.color = '#ffffff';
        HTMLstop.style.display = 'inline-block';
        runTimer();
        runMilTimer();
    }, animDelay);

    animDelay = 0;
}   

function stopGame(){
    gameStarted = false;
    clearTimers();

    for(let x=0 ; x<cardsAmount ; x++){
        let aC = animateCards();
        document.getElementById(x).style.top = `${aC[0]}px`;
        document.getElementById(x).style.left = `${aC[1]}px`;
        document.getElementById(x).style.transform = `rotate(${aC[2]}deg)`;
    }

    HTMLstop.style.display = 'none';
    HTMLstart.style.display = 'inline-block';
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

// Get some random parameters to animate cards shuffle
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

// Take action when clicked on a card
function playCard(id){
    if(gameStarted){
        if(!lock){
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
                        console.log(matches);
                        
                        if(matches == cardsAmount/2){
                            // Game over
                            clearTimers();
                        }

                        lock = true;
                        timerMatch = setTimeout(function(){

                            document.getElementById(firstCard.id).style.transform = 'skew(-0.06turn, 18deg)';
                            document.getElementById(secondCard.id).style.transform = 'skew(-0.06turn, 18deg)';

                            setTimeout(function(){
                                document.getElementById(firstCard.id).style.opacity = '0';
                                document.getElementById(secondCard  .id).style.opacity = '0';
                            }, 30);

                            setTimeout(function(){
                                document.getElementById(firstCard.id).style.visibility = 'hidden';
                                document.getElementById(secondCard.id).style.visibility = 'hidden';
                            }, 150);
                            
                            lock = false;
                        }, 550);
                    }

                    else return;
                }

                // not match
                else {
                    lock = true;
                    var fC = document.getElementById(firstCard.id),
                        sC = document.getElementById(secondCard.id);
                    
                    timerNotMatch = setTimeout(function(){    
                        fC.style.transform = 'rotate(35deg)';
                        sC.style.transform = 'rotate(35deg)';

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
    timer = setInterval(function(){
        newSecs++;
        
        if(newSecs < 10) newSecs = `0${newSecs}`;

        if(newSecs > 59){
            newSecs = 0;
            newMins++;
        }

        if(newMins == 10){
            clearTimers();
        }

        let output = `0${newMins}:${newSecs}`;
        HTMLtimeMain.innerHTML = output;
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