/**
 * Possible squares:
 * 16
 * 36
 * 64
 */

HTMLtarget = document.getElementById('target');

var cardsAmount = 16,
    cards1 = [],
    cards2 = [];

for(let x=0 ; x<cardsAmount/2 ; x++){
    cards1.push({src: x+1});
    cards2.push({src: x+1});
}

// In order to achvieve efficient permutation we need to use Fisher-Yates shuffle algorithm
function shuffle(cards) {
    var j, x, i;

    for (i=cards.length-1; i>0; i--){
        j = Math.floor(Math.random() * (i + 1));
        x = cards[i];
        cards[i] = cards[j];
        cards[j] = x;
    }

    return cards;
}

// Merge both arrays and shuffle elements
var sCards = shuffle(cards1.concat(cards2));

var output = '',
    inc = 0,
    sqrt = Math.sqrt(cardsAmount),
    defCard = 'secret.png';

for(let row=0 ; row<sqrt ; row++){
    for(let col=0 ; col<sqrt ; col++){
        output += `<li class="card" id=${inc} style="background-image:url('/cards/${defCard}');" onclick=decide(id)></li>`;
        inc++;
    }
    output += '<br>';
}

HTMLtarget.innerHTML = output;

var isWaiting = false,
    lock = false,
    firstCard = { src: '', id: '' },
    secondCard = { src: '', id: '' },
    intervalMatch,
    intervalNotMatch;
// console.log(intervalMatch);

function decide(id){
    if(!lock){
        let getSrc = sCards[id].src;

        // First reveal the cards
        document.getElementById(id).style.backgroundImage = `url(/cards/${getSrc}.png)`;

        // Isn't waiting
        if(!isWaiting){
            firstCard.src = getSrc;
            firstCard.id = id;
            isWaiting = true;
        }

        // Is waiting
        else {
            secondCard.src = getSrc;
            secondCard.id = id;
            lock = true;

            // match
            if(firstCard.src == secondCard.src){
                if(firstCard.id != secondCard.id){
                    intervalMatch = setTimeout(function(){
                        document.getElementById(firstCard.id).style.visibility = 'hidden';
                        document.getElementById(secondCard.id).style.visibility = 'hidden';
                        lock = false;
                    }, 800);
                }

                else return;
            }

            // not match
            else {
                intervalNotMatch = setTimeout(function(){
                    document.getElementById(firstCard.id).style.backgroundImage = `url(/cards/${defCard})`;
                    document.getElementById(secondCard.id).style.backgroundImage = `url(/cards/${defCard})`;
                    lock = false;
                }, 800);   
            }

            isWaiting = false;
        }
    }

    else {
        console.log('LOCKED.')
        return;
    }
}