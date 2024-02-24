import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Card, Offset, SUIT } from "../../models/model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  showFullScreenButton: boolean = true;
  errorMessage: string = '';

  PlayerNames: string[] = ['Noord', 'Oost', 'Zuid', 'West'];
  roundPlayer: number = 2;
  battlePlayer: number = this.roundPlayer;
  numberOfPlayed: number = -2;
  playingPlayer: number = -1;

  cards: Card[] = [];
  cardsOfPlayers: Card[][] = [];
  trumpSuitNr: number = 0;
  trumpSymbol: string = SUIT[this.trumpSuitNr].symbol;
  SUITS = SUIT;
  valueArray: number[][] = [[0,0,0,10,2,3,4,11],[0,0,14,10,20,3,4,11]];

  showChooseAnotherTrumpPopup: boolean = false;

  playersPlay: boolean[] = new Array(4).fill(undefined);

  offset: Offset[] = [0,1,2,3].map(() => new Offset());
  offsetSouthXdiff: number = 0;

  placeholderNorthRect: any;
  placeholderEastRect: any;
  placeholderSouthRect: any;
  placeholderWestRect: any;
  placeholderPlayerRect: any;

  movingCards: Card[] = new Array(4);

  northSouthRoundScore: number = 0;
  eastWestRoundScore: number = 0;
  northSouthBattlesWon: number = 0;
  eastWestBattlesWon: number = 0;

  northSouthRoundKudos: number = 0;
  eastWestRoundKudos: number = 0;
  northSouthTotalScore: number = 0;
  eastWestTotalScore: number = 0;

  round: number = 1;
  battleWinner: string = '';
  battleScore: number = 0;
  kudoScore:number = 0;

  endOfRound:boolean = false;
  roundWinnerText: string = '';

  gameOver: boolean = false;

  message: string = '';

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.startRound();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    this.resizeLayout();
  }

  openFullscreen() {
    const elem = document.getElementById("main");
    if (elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().then(() => {
          console.log('openFullscreen successfully done.');
        })
        // } else if (elem.webkitRequestFullscreen) { /* Safari */
        //   elem.webkitRequestFullscreen();
        // } else if (elem.msRequestFullscreen) { /* IE11 */
        //   elem.msRequestFullscreen();
      }
    }
  }

  showingFullScreen(): boolean {
    return !document.fullscreenElement;
  }

  private startRound() {
    let id:number = 0;
    const spread: number[] = [];
    this.cards = [];
    for (let suitNr = 0; suitNr < 4; suitNr++) {
      for (let value = 7; value <= 14; value++) {
        let imageUrl = 'assets/img/';
        switch (value) {
          case 11:
            imageUrl += 'jack_of_' + SUIT[suitNr].name;
            break;
          case 12:
            imageUrl += 'queen_of_' + SUIT[suitNr].name;
            break;
          case 13:
            imageUrl += 'king_of_' + SUIT[suitNr].name;
            break;
          case 14:
            imageUrl += 'ace_of_' + SUIT[suitNr].name;
            break;
          default:
            imageUrl += value.toLocaleString() + '_of_' + SUIT[suitNr].name;
        }
        imageUrl += '.png';

        this.cards.push({
          id: id++,
          nr: value,
          imageUrl: imageUrl,
          suitNr: suitNr,
          moving: false,
          used: false,
          value: this.valueArray[suitNr == this.trumpSuitNr ? 1 : 0][(value || 7) - 7]
        });
        spread.push(this.cards.length - 1);
      }
    }

    for (let playerNr = 0; playerNr < 4; playerNr++) {
      this.cardsOfPlayers[playerNr] = [];
      for (let i = 0; i < 8; i++) {
        const spreadNr = Math.floor(Math.random() * spread.length);
        this.cardsOfPlayers[playerNr].push(this.cards[spread[spreadNr]]);
        spread.splice(spreadNr, 1);
      }
      this.cardsOfPlayers[playerNr].sort((card1, card2) => this.sortCardsForPlayer(card1, card2));
    }
    this.resizeLayout();
    this.numberOfPlayed = -2;
    this.askPlayOrPassToPlayer(this.roundPlayer % 4);
  }

  private sortCardsForPlayer(card1: Card, card2: Card): number {
    const orderNumbers:number[][] = [[8,9,14,12,15,10,11,13],[0,1,2,6,3,4,5,7]];
    const card1order:number = orderNumbers[card1.suitNr === this.trumpSuitNr ? 0 : 1][card1.nr -7];
    const card2order:number = orderNumbers[card2.suitNr === this.trumpSuitNr ? 0 : 1][card2.nr -7];
    return card1.suitNr == this.trumpSuitNr ? card1order > card2order ? -1 : 1 : card2.suitNr != this.trumpSuitNr && card1.suitNr > card2.suitNr ? -1 : 1;
  }

  resizeLayout() {
    setTimeout(() => {
      const placeholderSouth = this.elementRef.nativeElement.querySelector('.south').getBoundingClientRect();
      const placeholderS = this.elementRef.nativeElement.querySelector('.placeholder-player').getBoundingClientRect();
      this.placeholderPlayerRect = this.elementRef.nativeElement.querySelector('.placeholder-player > .card-canvas:first-child').getBoundingClientRect();
      const secondSouthCard = this.elementRef.nativeElement.querySelector('.placeholder-player > .card-canvas:nth-child(2)').getBoundingClientRect();

      this.placeholderNorthRect = this.elementRef.nativeElement.querySelector('.placeholder-n > .card-canvas:first-child').getBoundingClientRect();
      this.placeholderEastRect =  this.elementRef.nativeElement.querySelector('.placeholder-e').getBoundingClientRect();
      this.placeholderSouthRect = this.elementRef.nativeElement.querySelector('.placeholder-s > .card-canvas:first-child').getBoundingClientRect();
      this.placeholderWestRect =  this.elementRef.nativeElement.querySelector('.placeholder-w').getBoundingClientRect();

      this.offset[0].x = this.elementRef.nativeElement.querySelector('.north').getBoundingClientRect().left - this.placeholderNorthRect.left;
      this.offset[0].y = this.elementRef.nativeElement.querySelector('.north').getBoundingClientRect().top - this.placeholderNorthRect.top;

      this.offset[1].x = this.elementRef.nativeElement.querySelector('.east').getBoundingClientRect().left - this.placeholderEastRect.left;
      this.offset[1].y = this.elementRef.nativeElement.querySelector('.east').getBoundingClientRect().top - this.placeholderEastRect.top;

      this.offset[2].x =  placeholderSouth.left - this.placeholderPlayerRect.left;
      this.offsetSouthXdiff = secondSouthCard.left - this.placeholderPlayerRect.left;
      this.offset[2].y = placeholderSouth.top - placeholderS.top;

      this.offset[3].x = this.elementRef.nativeElement.querySelector('.west').getBoundingClientRect().left - this.placeholderWestRect.left;
      this.offset[3].y = this.elementRef.nativeElement.querySelector('.west').getBoundingClientRect().top - this.placeholderWestRect.top;

      if (this.movingCards[0]) {
        this.movingCards[0].y = this.offset[0].y;
      }
      if (this.movingCards[1]) {
        this.movingCards[1].x = this.offset[1].x;
      }
      if (this.movingCards[3]) {
        this.movingCards[3].x = this.offset[3].x;
      }
      if (this.movingCards[2]) {
        this.movingCards[2].x = this.offset[2].x;
        this.movingCards[2].y = this.offset[2].y;
      }
    })
  }

  private askPlayOrPassToPlayer(playerNrCount: number) {
    const playerNr: number = playerNrCount % 4;
    if (playerNr === this.roundPlayer && this.playersPlay[playerNr] === false) { // Watch out: playerPlay really has to be false, not undefined!
      // Everyone passes
      if (playerNr === 2) {
        this.showChooseAnotherTrumpPopup = true;
        return;
      }
      // Check if player (not you) have better cards with another trump.
      let betterTrump:boolean = false;
      for (let suitNr = 0; !betterTrump && suitNr < 4; suitNr++) {
        if (suitNr === this.trumpSuitNr) {
          continue;
        }
        const jackAndNineTrump = this.cardsOfPlayers[playerNr].filter(card => card.suitNr === suitNr && [9,11].includes(card.nr)).length;
        if (jackAndNineTrump == 2) {
          this.trumpSuitNr = suitNr;
          betterTrump = true;
          break;
        }
        const aces = this.cardsOfPlayers[playerNr].filter(card => card.suitNr !== this.trumpSuitNr && card.nr === 14).length;
        if (aces === 3) {
          this.trumpSuitNr = suitNr;
          betterTrump = true;
          break;
        }
      }
      if (!betterTrump) {
        this.reshuffleCards();
        return;
      }
      this.trumpSymbol = SUIT[this.trumpSuitNr].symbol;
      this.cards.forEach(card => this.calculateCardValue(card));
      this.cardsOfPlayers[2].sort((card1, card2) => this.sortCardsForPlayer(card1, card2));
      this.playersPlay[playerNr] = true;
      this.playingPlayer = playerNr;
      setTimeout(() => {
        this.playersPlay = new Array(4).fill(undefined);
        this.numberOfPlayed = 0;
        this.nextTurn();
      }, 2000)
      return;
    }
    if (playerNr === 2) {
      this.numberOfPlayed = -1; // Ask South to play or pass.
      return;
    }
    this.playersPlay[playerNr] = this.cardsOfPlayers[playerNr].filter(card => card.suitNr === this.trumpSuitNr && [9,11].includes(card.nr)).length >= 2;
    if (!this.playersPlay[playerNr]) {
      this.playersPlay[playerNr] = this.cardsOfPlayers[playerNr].filter(card => card.suitNr !== this.trumpSuitNr && card.nr === 14).length >= 3;
    }
    if (this.playersPlay[playerNr]) {
      // This player wants to play, so no need to ask others, battle can start.
      this.playingPlayer = playerNr;
      setTimeout(() => {
        this.numberOfPlayed = 0;
        if (this.battlePlayer !== 2) {
          this.nextTurn();
        }
      }, 3000)
    } else {
      // So far, every player passes,  so continue with asking.
      setTimeout(() => {
        this.askPlayOrPassToPlayer((playerNr + 1) % 4);
      }, 2000)
    }
  }

  acceptTrump(play: boolean) {
    this.playersPlay[2] = play;
    if (play) { // South wants to play so let's start the battle
      this.playingPlayer = 2;
      this.numberOfPlayed = 0;
      if (this.roundPlayer !== 2) {
        this.nextTurn();
      } else {
        this.battlePlayer = 2;
      }
    } else { // South doesn't want to play so ask others.
      this.numberOfPlayed = -2;
      setTimeout(() => {
        this.askPlayOrPassToPlayer(3);
      }, 1000)
    }
  }

  selectAnotherTrump(trumpNr: number) {
    this.trumpSuitNr = trumpNr;
    this.trumpSymbol = SUIT[trumpNr].symbol;
    this.cards.forEach(card => this.calculateCardValue(card));
    this.cardsOfPlayers[2].sort((card1, card2) => this.sortCardsForPlayer(card1, card2));
    this.playingPlayer = 2;
    this.numberOfPlayed = 0;
    this.showChooseAnotherTrumpPopup = false;
  }

  reshuffleCards() {
    this.numberOfPlayed = 0;
    this.showChooseAnotherTrumpPopup = false;
    this.playersPlay = new Array(4).fill(undefined);
    this.trumpSuitNr = [0,1,2,3].filter(nr => nr !== this.trumpSuitNr)[Math.floor(Math.random()*3)];
    this.trumpSymbol = SUIT[this.trumpSuitNr].symbol;
    setTimeout(() => {
      this.startRound();
    }, 1000);
  }

  cardClick(card: Card): boolean {
    card.x = this.offset[2].x;
    card.y = this.offset[2].y;
    card.used = true;
    card.moving = true;
    this.movingCards[2] = card;
    setTimeout(() => {
      this.nextPlayer();
      if (this.numberOfPlayed === 4) {
        this.endOfBattle();
      } else {
        this.nextTurn();
      }
    }, 800);
    return true;
  }

  showValueOfCard(playerNr: number) {
    return this.cardsOfPlayers[playerNr].find(card => card.moving)?.value;
  }

  private allowedCardsForPlayerInCurrentBattle(playerNr: number): Card[] {
    const cards: Card[] = this.cardsOfPlayers[playerNr].filter(card => !card.used);
    // If player started battle, every card is allowed.
    if (this.numberOfPlayed === 0) {
      return cards;
    }

    // Determine suit of first player in this battle.
    let suitNr:number  | undefined;
    for (let i = playerNr + 1; i < playerNr + 4 && suitNr == undefined; i++) {
      const card:Card | undefined = this.cardsOfPlayers[i % 4].find(card => card.moving);
      if (card != undefined) {
        suitNr = card.suitNr;
      }
    }
    if (suitNr != undefined) { // If player has card(s) with suit, only these are allowed.
      if (cards.some(card => card.suitNr === suitNr)) {
        return cards.filter(card => card.suitNr === suitNr);
      }
    }

    // If 'mate' is in the lead (card with the highest value so far), any card is allowed.
    const matePlayerNr = (playerNr + 2) % 4;
    const cardOfMate: Card | undefined = this.cardsOfPlayers[matePlayerNr].find(card => card.moving);
    if (cardOfMate) {
      const score: number = this.cardsOfPlayers.filter((cardsOfPlayer, index) => index != matePlayerNr).filter(cardsOfPlayer => cardsOfPlayer.some(card => card.moving)).map(cardsOfPlayer => cardsOfPlayer.find(card => card.moving)?.value || 0).reduce((highestScore, score) => Math.max(highestScore, score), 0);
      if (cardOfMate.value > score) {
        return cards;
      }
    }

    // If player can't follow suit, try 'trump'
    if (this.cardsOfPlayers[playerNr].some(card => !card.used && card.suitNr === this.trumpSuitNr)) {
      // Check whether someone else already played trump.
      const highestTrumpScore:number = this.cardsOfPlayers.map(cardsOfPlayer => cardsOfPlayer.find(card => card.moving && card.suitNr === this.trumpSuitNr)?.value || 0).reduce((highestScore, score) => Math.max(highestScore, score), 0);
      if (highestTrumpScore > 0) {
        // Someone played trump so check if you have trump-cards of higher value
        if (this.cardsOfPlayers[playerNr].some(card => !card.used && card.suitNr === this.trumpSuitNr && card.value > highestTrumpScore)) {
          return this.cardsOfPlayers[playerNr].filter(card => !card.used && card.suitNr === this.trumpSuitNr && card.value > highestTrumpScore);
        } else {
          // So no trump-cards with higher value present, does player have other cards than trump?
          if (this.cardsOfPlayers[playerNr].some(card => !card.used && card.suitNr !== this.trumpSuitNr)) {
            // Only other cards (except trump) are allowed.
            return this.cardsOfPlayers[playerNr].filter(card => !card.used && card.suitNr !== this.trumpSuitNr);
          } // else, all cards, which are only trump-cards with lower value, are allowed.
        }
      }
    }
    return cards;
  }

  isCardDisabled(card: Card): boolean {
    if (card.moving) {
      return false;
    }
    if (this.battlePlayer !== 2 || [-2,-1,4].includes(this.numberOfPlayed)) {
      return true; // Disable all cards if it's not your turn
    }
    return !this.allowedCardsForPlayerInCurrentBattle(2).includes(card);
  }

  private bestGuessCard(): Card {
    const matePlayerNr = (this.battlePlayer + 2) % 4;
    const opponent1 = (this.battlePlayer + 1) % 4;
    const opponent2 = (this.battlePlayer + 3) % 4;
    const allowedCards: Card[] = this.allowedCardsForPlayerInCurrentBattle(this.battlePlayer);
    if (allowedCards.length === 0) {
      console.error('No allowedCards for player ' + this.battlePlayer);
    }
    if (allowedCards.length === 1) {
      return allowedCards[0];
    }
//    const maxValue: number = allowedCards.reduce((maxVal: number, card: Card) => Math.max(maxVal, card.value), 0);
//    const cardWithMaxValue: Card = allowedCards.reduce((cardWithMaxValue: Card, card: Card) => card.value > cardWithMaxValue.value ? card : cardWithMaxValue);

    // Is turn on player? Check if player has trump cards and use the card with the highest value.
    let card: Card | undefined;
    if (this.numberOfPlayed === 0) {
      // Player is first one of battle
      // 20240121.1  If player has all trump-cards that are left, player should keep them until his/her not-trump cards are used.
      if (allowedCards.some(card => card.suitNr === this.trumpSuitNr)
        && allowedCards.some(card => card.suitNr !== this.trumpSuitNr)
        && this.cardsOfPlayers[opponent1].concat(this.cardsOfPlayers[opponent2]).filter(card => !card.used).every(card => card.suitNr != this.trumpSuitNr)) {
//        console.log('Player ' + this.PlayerNames[this.battlePlayer] + ' has all trump-cards that are left and has other cards');
      } else {
        if (!this.cards.some(card => card.used && card.suitNr === this.trumpSuitNr && card.nr === 11)) { // check trump Jack
          card = allowedCards.find(card => card.suitNr === this.trumpSuitNr && card.nr === 11);
        } else {
          if (!this.cards.some(card => card.used && card.suitNr === this.trumpSuitNr && card.nr === 9)) { // check trump nine
            card = allowedCards.find(card => card.suitNr === this.trumpSuitNr && card.nr === 9);
          } else {
            if (!this.cards.some(card => card.used && card.suitNr === this.trumpSuitNr && card.nr === 14)) { // check trump ace
              card = allowedCards.find(card => card.suitNr === this.trumpSuitNr && card.nr === 14);
            } else {
              if (!this.cards.some(card => card.used && card.suitNr === this.trumpSuitNr && card.nr === 10)) { // check trump ten
                card = allowedCards.find(card => card.suitNr === this.trumpSuitNr && card.nr === 10);
              }
            }
          }
        }
      }
      if (card == undefined) { // Check ace
        card = allowedCards.find(card => card.suitNr !== this.trumpSuitNr && card.nr === 14);
      }
      if (card) {
        return card;
      }
    }

    // Determine playerNr and card of first player of this battle.
    let firstPlayer: number = (this.battlePlayer - this.numberOfPlayed + 4) % 4;
    let firstCardOfThisBattle:Card | undefined = this.cardsOfPlayers[firstPlayer].find(card => card.moving);
    if (firstCardOfThisBattle) {
      const cardOfMate: Card | undefined = this.cardsOfPlayers[(this.battlePlayer + 2) % 4].find(card => card.moving);
      const cardOfOtherOpponent: Card | undefined = this.cardsOfPlayers[(firstPlayer + 2) % 4].find(card => card.moving);
      if (allowedCards.some(card => card.suitNr === firstCardOfThisBattle?.suitNr)) {
        let highestValueOfOpponent: number = 0;
        if (firstPlayer === matePlayerNr) {
          const cardOfOpponent: Card | undefined = this.cardsOfPlayers[(firstPlayer + 1) % 4].find(card => card.moving);
          if (cardOfOpponent && cardOfOpponent.suitNr === firstCardOfThisBattle.suitNr && cardOfOpponent.value > firstCardOfThisBattle.value) {
            highestValueOfOpponent = cardOfOpponent.value;
          } else {
            if (cardOfOpponent?.suitNr === this.trumpSuitNr) {
              // I don't have trump, so I can't beat opponent.
              return allowedCards.sort((a, b) => a.value <= b.value ? -1 : 1)[0]; // lowest card
            }
          }
        } else {
          // There is a first card and it's from an opponent.
          if (cardOfOtherOpponent?.suitNr === this.trumpSuitNr) {
            // I don't have trump, so I can't beat other opponent.
            return allowedCards.sort((a, b) => a.value <= b.value ? -1 : 1)[0]; // lowest card
          }
          highestValueOfOpponent = Math.max(firstCardOfThisBattle.value, cardOfOtherOpponent?.value || 0);
        }

        // Let's see if I have a card with higher value
        if (allowedCards.filter(card => card.suitNr === firstCardOfThisBattle?.suitNr || card.suitNr === this.trumpSuitNr).reduce((maxValue, card) => Math.max(maxValue, card.value), 0) > highestValueOfOpponent) {
          return allowedCards.sort((a, b) => a.value >= b.value ? -1 : 1)[0];
        } else {
          // If not, play the card with the lowest level
          return allowedCards.sort((a, b) => a.value <= b.value ? -1 : 1)[0];
        }
      } else {
        // Do you have trump and is it needed to use one?
        if (firstCardOfThisBattle.suitNr !== this.trumpSuitNr) {
          if (cardOfOtherOpponent && cardOfOtherOpponent.suitNr === this.trumpSuitNr) {
            if (allowedCards.filter(card => card.suitNr === this.trumpSuitNr).some(card => card.value > cardOfOtherOpponent.value)) {
              // Answer with the highest trump card
              return allowedCards.filter(card => card.suitNr === this.trumpSuitNr).sort((a, b) => a.value >= b.value ? -1 : 1)[0];
            }
          } else {
            // You can use your lowest trump card to win this battle if you have.
            if (allowedCards.filter(card => card.suitNr === this.trumpSuitNr).length > 0) {
              return allowedCards.filter(card => card.suitNr === this.trumpSuitNr).sort((a, b) => a.value <= b.value ? -1 : 1)[0];
            }
          }
        }


        // If mate started battle with the highest value for that suit that is still available, use the lowest one (if player has cards of that suit)
        if (cardOfMate && matePlayerNr === firstPlayer) {
          const availableCardsOpponents = this.cardsOfPlayers[opponent1].concat(this.cardsOfPlayers[opponent2]).filter(card => card.suitNr === cardOfMate.suitNr && !card.used);
          if (availableCardsOpponents && availableCardsOpponents.length > 0) {
            const highestAvailableCard = availableCardsOpponents.reduce((cardWithMaxValue: Card, card: Card) => card.value > cardWithMaxValue.value ? card : cardWithMaxValue);
            if (highestAvailableCard && cardOfMate.value >= highestAvailableCard.value) {
              // Does player have cards of suit?
              const c = allowedCards.filter(card => card.suitNr === cardOfMate.suitNr);
              if (c && c.length > 0) {
                const cardOfSuitWithLowestValue = c.reduce((cardWithMaxValue: Card, card: Card) => card.value < cardWithMaxValue.value ? card : cardWithMaxValue);
                if (cardOfSuitWithLowestValue) {
                  return cardOfSuitWithLowestValue;
                }
              }
            }
          }
        }

        // (20240224-1) If mate didn't start battle but played a trump-card, use a low-level non-trump-card.
        if (cardOfMate && matePlayerNr !== firstPlayer) {
          if (firstCardOfThisBattle.suitNr !== this.trumpSuitNr && cardOfMate.suitNr === this.trumpSuitNr) {
            const availableCardsOpponents = this.cardsOfPlayers[opponent1].concat(this.cardsOfPlayers[opponent2]).filter(card => card.suitNr === this.trumpSuitNr && !card.used);
            if (availableCardsOpponents && availableCardsOpponents.length > 0) {
              const highestAvailableCard = availableCardsOpponents.reduce((cardWithMaxValue: Card, card: Card) => card.value > cardWithMaxValue.value ? card : cardWithMaxValue);
              if (cardOfMate.value > highestAvailableCard.value) {
                // No need to use trump, use card with the lowest value
                return allowedCards.filter(card => card.suitNr !== this.trumpSuitNr).length > 0 ?
                  allowedCards.filter(card => card.suitNr !== this.trumpSuitNr).reduce((lowestValueCard, card) => card.value < lowestValueCard.value ? card : lowestValueCard) :
                  allowedCards.filter(card => card.suitNr === this.trumpSuitNr).reduce((lowestValueCard, card) => card.value < lowestValueCard.value ? card : lowestValueCard);
              }
            }
          }
        }

/*
        // If mate started battle with the highest possible trump, use the lowest one (if player has trump cards)
        if (matePlayerNr === firstPlayer && cardOfMate && cardOfMate.suitNr === this.trumpSuitNr) {
          const highestAvailableCard = this.cardsOfPlayers[opponent1].concat(this.cardsOfPlayers[opponent2]).filter(card => card.suitNr === this.trumpSuitNr && !card.used).reduce((cardWithMaxValue: Card, card: Card) => card.value > cardWithMaxValue.value ? card : cardWithMaxValue);
          if (cardOfMate.value >= highestAvailableCard.value) {
            // Does player have trump cards?
            const lowestTrump = allowedCards.filter(card => card.suitNr === this.trumpSuitNr).sort((a,b) => a.value < b.value ? -1 : 1).find(card => true);
            if (lowestTrump) {
              return lowestTrump;
            }
          }
        }
*/
        // First check if Mate will win this battle so that you can sign (seinen)
        if (cardOfOtherOpponent) { // All other parties have played
          if (firstCardOfThisBattle.suitNr !== this.trumpSuitNr && cardOfOtherOpponent.suitNr !== this.trumpSuitNr && (cardOfMate?.suitNr === this.trumpSuitNr || (cardOfMate?.suitNr === firstCardOfThisBattle.suitNr && Math.max(firstCardOfThisBattle.value, cardOfOtherOpponent.value) >= (cardOfMate?.value || 0)))) {
            // Let's see if you can give a signal to your mate.
            for (let suitNr = 0; suitNr < 4; suitNr++) {
              if (suitNr === this.trumpSuitNr) continue;
              const ace:[number,Card] = this.cardsOfPlayers[this.battlePlayer].filter(card => !card.used && card.suitNr === suitNr).reduce((found, card:Card) => [10,14].includes(card.nr) ? [<number>found[0]+1,card]:[found[0],<Card>found[1]], [0,this.cards[0]]);
              if (ace[0] === 2) {
                return ace[1];
              }
            }
            for (let suitNr = 0; suitNr < 4; suitNr++) {
              if (suitNr === this.trumpSuitNr) continue;
              if (this.cardsOfPlayers[this.battlePlayer].some(card => !card.used && card.suitNr === suitNr && card.nr === 14)) {
                const card:Card | undefined = this.cardsOfPlayers[this.battlePlayer].find(card => !card.used && card.suitNr === suitNr && card.value === 0);
                if (card) {
                  return card;
                }
              }
            }
            for (let suitNr = 0; suitNr < 4; suitNr++) {
              if (suitNr === this.trumpSuitNr) continue;
              if (this.cardsOfPlayers[this.battlePlayer].some(card => !card.used && card.suitNr === suitNr && card.nr === 10)) {
                continue;
              }
              const card:Card | undefined = this.cardsOfPlayers[this.battlePlayer].find(card => !card.used && card.suitNr === suitNr && [11,12,13].includes(card.value));
              if (card) {
                return card;
              }
            }
          }
        }
      }
    }
    return allowedCards.sort((a, b) => a.value <= b.value ? -1 : 1)[0];
  }

  nextTurn() {
    if (this.battlePlayer === 2) {
      return; // Skip South, that's you.
    }

    const card: Card = this.bestGuessCard();
    if (card) {
      card.x = this.offset[this.battlePlayer].x;
      card.y = this.offset[this.battlePlayer].y;
      card.moving = true;
      card.used = true;
      this.movingCards[this.battlePlayer] = card;
    } else {
      console.error('Player ' + this.battlePlayer + ' has no allowed card in ', this.cardsOfPlayers[this.battlePlayer]);
    }
    setTimeout(() => {
      this.cardsOfPlayers[this.battlePlayer].sort((card1:Card) => card1.used ? -1 : 1);
      this.nextPlayer();
      if (this.numberOfPlayed === 4) {
        this.endOfBattle();
      } else {
        this.nextTurn();
      }
    }, 1000)
  }

  endOfBattle() {
    // Who won the battle?
    let winnerPlayer:number = -1;
    // Has somebody used (highest) trump?
    const suitStarted:number = this.cardsOfPlayers[this.battlePlayer].find(card => card.moving)?.suitNr || 0; // because typescript sees ?.0 also as false
    if (suitStarted !== this.trumpSuitNr) {
      const playerWithHighestTrump: number[] = this.cardsOfPlayers.map((cardsOfPlayer, index) => [cardsOfPlayer.find(card => card.moving && card.suitNr === this.trumpSuitNr)?.value ?? -1, index]).sort((score1, score2) => score1[0] > score2[0] ? -1 : score1[0] == score2[0] && score1[1] == this.battlePlayer ? -1 : 1)[0];
      if (playerWithHighestTrump[0] >= 0) {
        winnerPlayer = playerWithHighestTrump[1];
      }
    }
    if (winnerPlayer < 0) { // No trump used.
      // Who has the card with the highest value with the same suit as the player who started the battle?
      const playerWithHighestSuit: number[] = this.cardsOfPlayers.map((cardsOfPlayer, index) => [cardsOfPlayer.find(card => card.moving && card.suitNr === suitStarted)?.value ?? -1, index]).sort((score1, score2) => score1[0] > score2[0] ? -1 : score1[0] == score2[0] && score1[1] == this.battlePlayer ? -1 : 1)[0];
      winnerPlayer = playerWithHighestSuit[1];
    }
    this.battleWinner = this.PlayerNames[winnerPlayer];
    let totalScore = this.cards.filter((card: Card) => card.moving).map(card => card.value).reduce((totalScore: number, cardScore) => totalScore + cardScore);
    const lastBattleOfRound: boolean = !this.cardsOfPlayers[0].some(card => !card.used);
    if (lastBattleOfRound) {
      totalScore += 10;
    }
    this.battleScore = totalScore;
    const sameSuits = this.cards.filter((card: Card) => card.moving).reduce((result: number[], card) => {if (card.nr > 10) result[card.nr]++; return result;}, new Array(13).fill(0)).reduce((max:number, elem) => elem > max ? elem : max, 0);
    this.kudoScore = sameSuits == 4 ? 100 : 0;
    const consecutive = this.cards.filter((card: Card) => card.moving).sort((a,b) => a.nr < b.nr ? -1:1)
        .reduce((result, element) => [element.suitNr,element.nr,element.suitNr === result[0] && element.nr == result[1] + 1 ? result[2] + 1 : result[2] == 1 ? 0 : result[2]], [0,0,0]);
    this.kudoScore += consecutive[2] == 3 ? 50 : consecutive[2] == 2 ? 20 : 0;
    if (this.kudoScore > 0 && this.cards.filter((card: Card) => card.moving && card.suitNr == this.trumpSuitNr).reduce((stuk: number, card) => stuk + ([12,13].includes(card.nr) ? 1 : 0), 0) == 2) {
      this.kudoScore += 20; // "stuk"
    }

    setTimeout(() => { // Reset playfield after some time.
      const won = [this.placeholderNorthRect, this.placeholderEastRect, this.placeholderSouthRect, this.placeholderWestRect][winnerPlayer];
      if (this.movingCards[0] && this.movingCards[1] && this.movingCards[1] && this.movingCards[2] && this.movingCards[3]) {
        this.movingCards[0].x = won.left - this.placeholderNorthRect.left;
        this.movingCards[0].y = won.top - this.placeholderNorthRect.top;
        this.movingCards[1].x = won.left - this.placeholderEastRect.left;
        this.movingCards[1].y = won.top - this.placeholderEastRect.top;
        this.movingCards[2].x = won.left - this.placeholderSouthRect.left + this.offset[2].x;
        this.movingCards[2].y = won.top - this.placeholderPlayerRect.top;
        this.movingCards[3].x = won.left - this.placeholderWestRect.left;
        this.movingCards[3].y = won.top - this.placeholderWestRect.top;

        setTimeout(() => {
          // Todo: https://stackoverflow.com/questions/50908130/angular-5-add-style-to-specific-element-dynamically
          this.movingCards.forEach((card: Card) => {
            (this.elementRef.nativeElement.querySelector('#card-' + card?.id) as HTMLElement).style.visibility = 'hidden';
          });
        }, 700);
      }
      if ([0,2].includes(winnerPlayer)) {
        this.northSouthBattlesWon++;
        this.northSouthRoundScore += totalScore;
        this.northSouthRoundKudos += this.kudoScore;
      } else {
        this.eastWestBattlesWon++;
        this.eastWestRoundScore += totalScore;
        this.eastWestRoundKudos += this.kudoScore;
      }

      this.battlePlayer = winnerPlayer;
      this.numberOfPlayed = 0;
      this.cards.forEach(c => c.moving = false);
      this.message = '';
      if (lastBattleOfRound) {
        const halfTotalScore: number = (this.northSouthRoundScore + this.northSouthRoundKudos + this.eastWestRoundScore + this.eastWestRoundKudos) / 2;
        if ([0,2].includes(this.roundPlayer)) {
          if (this.northSouthRoundScore + this.northSouthRoundKudos >= halfTotalScore + 1) {
            // this.northSouthTotalScore += this.northSouthRoundScore + (this.northSouthRoundScore >= 162 ? 100 : 0);
            // this.eastWestTotalScore += this.eastWestRoundScore;
            this.roundWinnerText = 'Noord/Zuid hebben deze ronde gewonnen en krijgen hun punten: ' + (this.northSouthRoundScore + this.northSouthRoundKudos + (this.northSouthRoundScore >= 162 ? 100 : 0));
            if (this.northSouthBattlesWon == 8) {
              this.roundWinnerText += ', en 100 punten pit.'; // Pit for east&west
            }
            this.roundWinnerText += '<br><br>Oost/West krijgen hun ' + (this.eastWestRoundScore + this.eastWestRoundKudos) + ' punten.';
          } else {
            this.roundWinnerText = 'Oost/West heeft gewonnen en krijgt alle punten: ' + (this.northSouthRoundScore + this.northSouthRoundKudos + this.eastWestRoundScore + this.eastWestRoundKudos);
            // this.eastWestTotalScore += this.northSouthRoundScore + this.northSouthRoundKudos + this.eastWestRoundScore + this.eastWestRoundKudos;
          }
        } else {
          if (this.eastWestRoundScore + this.eastWestRoundKudos >= halfTotalScore + 1) {
            // this.northSouthTotalScore += this.northSouthRoundScore;
            // this.eastWestTotalScore += this.eastWestRoundScore + (this.eastWestRoundScore >= 162 ? 100 : 0);
            this.roundWinnerText = 'Oost/West heeft deze ronde gewonnen en krijgt hun punten: ' + (this.eastWestRoundScore + this.eastWestRoundKudos + (this.eastWestRoundScore >= 162 ? 100 : 0));
            if (this.eastWestBattlesWon == 8) {
              this.roundWinnerText += ', en 100 punten pit.'; // Pit for north&south
            }
            this.roundWinnerText += '<br><br>Noord/Zuid krijgen hun ' + (this.northSouthRoundScore + this.northSouthRoundKudos) + ' punten.';
          } else {
            this.roundWinnerText = 'Noord/Zuid heeft gewonnen en krijgt alle punten: ' + (this.northSouthRoundScore + this.northSouthRoundKudos + this.eastWestRoundScore + this.eastWestRoundKudos);
            // this.northSouthTotalScore += this.northSouthRoundScore + this.northSouthRoundKudos + this.eastWestRoundScore + this.eastWestRoundKudos;
          }
        }
        // this.northSouthRoundScore = this.northSouthRoundKudos = this.eastWestRoundScore = this.eastWestRoundKudos = 0;
        this.endOfRound = true;
        setTimeout(() => {
          if ([0,2].includes(this.roundPlayer)) {
            if (this.northSouthRoundScore + this.northSouthRoundKudos >= halfTotalScore + 1) {
              this.northSouthTotalScore += this.northSouthRoundScore + this.northSouthRoundKudos + (this.northSouthBattlesWon == 8 ? 100 : 0);
              this.eastWestTotalScore += this.eastWestRoundScore + this.eastWestRoundKudos;
              // this.roundWinner = 'Noord/Zuid';
            } else {
              // this.roundWinner = 'Oost/West';
              this.eastWestTotalScore += this.northSouthRoundScore + this.northSouthRoundKudos + this.eastWestRoundScore + this.eastWestRoundKudos;
            }
          } else {
            if (this.eastWestRoundScore + this.eastWestRoundKudos >= halfTotalScore + 1) {
              this.northSouthTotalScore += this.northSouthRoundScore + this.northSouthRoundKudos;
              this.eastWestTotalScore += this.eastWestRoundScore + this.eastWestRoundKudos + (this.eastWestBattlesWon == 8 ? 100 : 0);
              // this.roundWinner = 'Oost/West';
            } else {
              // this.roundWinner = 'Noord/Zuid';
              this.northSouthTotalScore += this.northSouthRoundScore + this.northSouthRoundKudos + this.eastWestRoundScore + this.eastWestRoundKudos;
            }
          }
          this.northSouthRoundScore = this.northSouthRoundKudos = this.eastWestRoundScore = this.eastWestRoundKudos = 0;

          setTimeout(() => {
            this.endOfRound = false;
            this.numberOfPlayed = -2;
            this.northSouthBattlesWon = 0;
            this.eastWestBattlesWon = 0;
            if (this.round >= 16) {
              this.battlePlayer = 2;
              this.playersPlay = new Array(4).fill(undefined);
              this.gameOver = true;
            } else {
              this.roundPlayer = (this.roundPlayer + 1) % 4;
              this.battlePlayer = this.roundPlayer;
              this.playingPlayer = -1;
              this.round++;
              this.trumpSuitNr = Math.floor(Math.random() * 4);
              this.trumpSymbol = SUIT[this.trumpSuitNr].symbol;
              this.playersPlay = new Array(4).fill(undefined);
              this.startRound();
            }
          }, 200);
        }, 10000);
      } else {
        setTimeout(() => { // Wait until cards are removed from work-area.
          this.nextTurn();
        }, 900)
      }
    }, 3000);
  }

  startNewGame() {
    this.northSouthTotalScore = 0;
    this.eastWestTotalScore = 0;
    this.trumpSuitNr = 0;
    this.trumpSymbol = this.SUITS[this.trumpSuitNr].symbol;
    this.round = 1;
    this.roundPlayer = 2;
    this.gameOver = false;
    this.startRound();
  }

  private nextPlayer() {
    this.battlePlayer = (this.battlePlayer + 1) % 4;
    this.numberOfPlayed++;
  }

  private calculateCardValue(card: Card): Card {
    card.value = this.valueArray[card?.suitNr == this.trumpSuitNr ? 1 : 0][(card?.nr || 7) - 7];
    return card;
  }

  closeErrorPopup() {
    this.errorMessage = '';
  }
}
