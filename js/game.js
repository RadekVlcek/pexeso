window.onload = init;

var timerMatch,
    timerNotMatch,
    timerGame,
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
    HTMLtarget = document.getElementById('target'),
    HTMLtime = document.getElementById('time'),
    HTMLtimeMain = document.getElementById('main'),
    HTMLtimeMili = document.getElementById('mili');

function init(){
    for(let x=0 ; x<cardsAmount/2 ; x++){
        cards1.push({src: x+1});
        cards2.push({src: x+1});
    }

    // Merge both arrays and shuffle elements
    sCards = shuffleCards(cards1.concat(cards2));

    printCards();

    HTMLstart.addEventListener('click', runTimers);
}

// Run both timers
function runTimers(){
    HTMLstart.style.display = 'none';
    gameStarted = true;
    
    for(let x=0 ; x<3 ; x++){
        setTimeout(function(){
            for(let y=0 ; y<cardsAmount ; y++){
                let aC = animateCards();
                document.getElementById(y).style.top = `${aC[0]}px`;
                document.getElementById(y).style.left = `${aC[1]}px`;
                document.getElementById(y).style.transform = `rotate(${aC[2]}deg)`;
            }
        }, animDelay);

        animDelay += 500;
    }

    setTimeout(function(){
        for(let y=0 ; y<cardsAmount ; y++){
            document.getElementById(y).style.top = '0px';
            document.getElementById(y).style.left = '0px';
            document.getElementById(y).style.transform = 'rotate(0deg)';
        }
    }, animDelay);
        
    animDelay = 0;
    runTimer();
    runMilTimer();
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
        r = Math.floor(Math.random() * (180 - 1) - 1);

    return [top, left, r];
}

// Print cards
function printCards(){
    var inc = 0,
        sqrt = Math.sqrt(cardsAmount);

    for(let row=0 ; row<sqrt ; row++){
        for(let col=0 ; col<sqrt ; col++){
            var aC = animateCards();
            output += `<li class="card" id=${inc} style="background-image:url('/cards/${defCard}'); top: ${aC[0]}px; left: ${aC[1]}px; transform: rotate(${aC[2]}deg)" onclick=playCard(id)></li>`;
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
            document.getElementById(id).style.backgroundImage = `url(/cards/${getSrc}.png)`;

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
                            console.log('Game over');
                            clearInterval(timerGame);
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
                    timerNotMatch = setTimeout(function(){
                        document.getElementById(firstCard.id).style.backgroundImage = `url(/cards/${defCard})`;
                        document.getElementById(secondCard.id).style.backgroundImage = `url(/cards/${defCard})`;
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

// Run the timer
function runTimer(){
    setTimeout(function(){
        timerGame = setInterval(function(){
            newSecs++;
    
            if(newSecs < 10) newSecs = `0${newSecs}`;
    
            if(newSecs > 59){
                newSecs = 0;
                newMins++;
            }
    
            let output = `0${newMins}:${newSecs}`;
    
            HTMLtimeMain.innerHTML = output;
        }, 1000);
    }, 500);
}

function runMilTimer(){
    setTimeout(function(){
        setInterval(function(){
            newMils++;

            if(newMils > 9) newMils = 0;
            
            HTMLtimeMili.innerHTML = newMils;
        }, 100);
    }, 500);
}

