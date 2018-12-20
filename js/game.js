window.onload = init;

var cardsAmount = 36,
    cards1 = [],
    cards2 = [],
    sCards,
    matches = 0,
    isWaiting = false,
    lock = false,
    firstCard = { src: '', id: '' },
    secondCard = { src: '', id: '' },
    timerMatch,
    timerNotMatch,
    timerGame,
    newSecs = 0,
    newMins = 0;
    newMils = 0;
    output = '',
    inc = 0,
    sqrt = Math.sqrt(cardsAmount),
    defCard = 'secret.png',
    HTMLstart = document.getElementById('start'),
    HTMLtarget = document.getElementById('target');
    HTMLtime = document.getElementById('time');
    HTMLtimeMain = document.getElementById('main');
    HTMLtimeMili = document.getElementById('mili');

function init(){
    HTMLstart.addEventListener('click', prepCards);
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

// Print cards
function printCards(){
    for(let row=0 ; row<sqrt ; row++){
        for(let col=0 ; col<sqrt ; col++){
            output += `<li class="card" id=${inc} style="background-image:url('/cards/${defCard}');" onclick=playCard(id)></li>`;
            inc++;
        }
        output += '<br>';
    }

    HTMLtarget.innerHTML = output;
}

// Take action when clicked on a card
function playCard(id){
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
                    lock = true;
                    timerMatch = setTimeout(function(){

                        document.getElementById(firstCard.id).style.transform = 'skew(-0.06turn, 18deg)';
                        document.getElementById(secondCard.id).style.transform = 'skew(-0.06turn, 18deg)';

                        setTimeout(function(){
                            document.getElementById(firstCard.id).style.opacity = '0';
                            document.getElementById(secondCard  .id).style.opacity = '0';
                        }, 50);

                        setTimeout(function(){
                            document.getElementById(firstCard.id).style.visibility = 'hidden';
                            document.getElementById(secondCard.id).style.visibility = 'hidden';
                        }, 150);
                        
                        lock = false;
                    }, 700);
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

// Run the timer
function runTimer(){
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
}

function runMilTimer(){
    setInterval(function(){
        newMils++;

        if(newMils > 9) newMils = 0;
        
        HTMLtimeMili.innerHTML = newMils;
    }, 100);
}

// Prepare cards
function prepCards(){
    // HTMLstart.style.display = 'none';

    runTimer();
    runMilTimer();

    for(let x=0 ; x<cardsAmount/2 ; x++){
        cards1.push({src: x+1});
        cards2.push({src: x+1});
    }

    // Merge both arrays and shuffle elements
    sCards = shuffleCards(cards1.concat(cards2));

    printCards();
}