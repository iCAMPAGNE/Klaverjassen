import {AfterViewInit, Component, ElementRef, HostListener, OnInit} from '@angular/core';
import {Card, SUIT, SUITS} from "../../models/model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  showFullScreenButton: boolean = true;

  Players: string[] = ['North', 'East', 'South', 'West'];
  player: string = this.Players[2];
  numberOfPlayed: number = 0;

  cards: Card[] = [];
  spread: number[] = [];
  nr: number = 0;
  cardsOfPlayers: Card[][] = [];
  troef: SUIT = SUIT.CLUBS;
  troefSymbol: string = SUITS.CLUBS.symbol;
  offsetSouthX: number = 0;
  offsetSouthXdiff: number = 0;
  offsetSouthY: number = 0;

  offsetNorthX: number = 0;
  offsetNorthY: number = 0;

  offsetEastX: number = 0;
  offsetEastY: number = 0;

  offsetWestX: number = 0;
  offsetWestY: number = 0;

  placeholderNorthRect: any;
  placeholderEastRect: any;
  placeholderSouthRect: any;
  placeholderWestRect: any;
  placeholderPlayerRect: any;

  cardNorth?: Card;
  cardEast?: Card;
  cardSouth?: Card;
  cardWest?: Card;

  scoreNorthSouth: number = 0;
  scoreEastWest: number = 0;
  roemNorthSouth: number = 0;
  roemEastWest: number = 0;

  round: number = 1;

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

  ngAfterViewInit(): void {
  };

  private startRound() {
    this.cards = [];
    Object.values(SUIT).forEach((suit:SUIT) => {
      for (let value = 7; value <= 14; value++) {
        let imageUrl = 'assets/img/';
        switch (value) {
          case 11:
            imageUrl += 'jack_of_' + suit;
            break;
          case 12:
            imageUrl += 'queen_of_' + suit;
            break;
          case 13:
            imageUrl += 'king_of_' + suit;
            break;
          case 14:
            imageUrl += 'ace_of_' + suit;
            break;
          default:
            imageUrl += value.toLocaleString() + '_of_' + suit;
        }
        imageUrl += '.png';

        const id = this.nr++;
        this.cards.push({
          id: id,
          value: value,
          imageUrl: imageUrl,
          type: suit,
          moving: false,
          used: false,
          score: 0
        });
        this.spread.push(this.cards.length - 1);
      }
    });

    for (let playerNr = 0; playerNr < 4; playerNr++) {
      this.cardsOfPlayers[playerNr] = [];
      for (let i = 0; i < 8; i++) {
        const spreadNr = Math.floor(Math.random() * this.spread.length);
        this.cardsOfPlayers[playerNr].push(this.cards[this.spread[spreadNr]]);
        this.spread.splice(spreadNr, 1);
      }
      this.cardsOfPlayers[playerNr].sort((card1, card2) => this.sortCardsForPlayer(card1, card2));
    }
    this.resizeLayout();
  }

  private sortCardsForPlayer(card1: Card, card2: Card): number {
    const orderNumbers:number[][] = [[8,9,14,12,15,10,11,13],[0,1,2,6,3,4,5,7]];
    const card1order:number = orderNumbers[card1.type === this.troef ? 0 : 1][card1.value -7];
    const card2order:number = orderNumbers[card2.type === this.troef ? 0 : 1][card2.value -7];
    return card1.type < card2.type ? -1 : card1.type === card2.type ? card1order < card2order ? 1 : -1 : 1;
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

      this.offsetNorthX = this.elementRef.nativeElement.querySelector('.north').getBoundingClientRect().left - this.placeholderNorthRect.left;
      this.offsetNorthY = this.elementRef.nativeElement.querySelector('.north').getBoundingClientRect().top - this.placeholderNorthRect.top;

      this.offsetEastX = this.elementRef.nativeElement.querySelector('.east').getBoundingClientRect().left - this.placeholderEastRect.left;
      this.offsetEastY = this.elementRef.nativeElement.querySelector('.east').getBoundingClientRect().top - this.placeholderEastRect.top;

      this.offsetSouthX =  placeholderSouth.left - this.placeholderPlayerRect.left;
      this.offsetSouthXdiff = secondSouthCard.left - this.placeholderPlayerRect.left;
      this.offsetSouthY = placeholderSouth.top - placeholderS.top;

      this.offsetWestX = this.elementRef.nativeElement.querySelector('.west').getBoundingClientRect().left - this.placeholderWestRect.left;
      this.offsetWestY = this.elementRef.nativeElement.querySelector('.west').getBoundingClientRect().top - this.placeholderWestRect.top;

      if (this.cardNorth) {
        this.cardNorth.y = this.offsetNorthY;
      }
      if (this.cardEast) {
        this.cardEast.x = this.offsetEastX;
      }
      if (this.cardWest) {
        this.cardWest.x = this.offsetWestX;
      }
      if (this.cardSouth) {
        this.cardSouth.x = this.offsetSouthX;
        this.cardSouth.y = this.offsetSouthY;
      }
    })
  }

  cardClick(card: Card): boolean {
    card.x = this.offsetSouthX;
    card.y = this.offsetSouthY;
    card.used = true;
    card.moving = true;
    this.cardSouth = card;
    this.nextPlayer();
    if (this.numberOfPlayed === 4) {
      this.endOfBattle();
    } else {
      this.nextTurn();
    }
    return true;
  }

  private allowedCardsForPlayerInCurrentBattle(playerNr: number): Card[] {
    const cards: Card[] = this.cardsOfPlayers[playerNr].filter(card => !card.used);
    // If player started battle, every card is allowed.
    if (this.numberOfPlayed === 0) {
      return cards;
    }

    // Calculate scores of cards played so far
    this.cardsOfPlayers.filter((cardsOfPlayer: Card[], index) => index != playerNr).forEach((cardsOfOtherPlayer: Card[]) => cardsOfOtherPlayer.filter(card => card.moving).forEach(card => this.calculatePoints(card)));

    // Determine suit of first player in this battle.
    let suit:SUIT | undefined;
    for (let i = playerNr + 1; i < playerNr + 4 && !suit; i++) {
      suit = this.cardsOfPlayers[i % 4].find(card => card.moving)?.type;
    }
    if (suit) { // If player has card(s) with suit, only these are allowed.
      if (cards.some(card => card.type === suit)) {
        return cards.filter(card => card.type === suit);
      }
    }

    // If 'mate' is in the lead (card with the highest value so far), any card is allowed.
    const matePlayerNr = (playerNr + 2) % 4;
    const cardOfMate: Card | undefined = this.cardsOfPlayers[matePlayerNr].find(card => card.moving);
    if (cardOfMate) {
      const score: number = this.cardsOfPlayers.filter((cardsOfPlayer, index) => index != matePlayerNr).filter(cardsOfPlayer => cardsOfPlayer.some(card => card.moving)).map(cardsOfPlayer => cardsOfPlayer.find(card => card.moving)?.score || 0).reduce((highestScore, score) => Math.max(highestScore, score), 0);
      if (cardOfMate.score > score) {
        return cards;
      }
    }

    // If player can't follow suit, try 'troef'
    if (this.cardsOfPlayers[playerNr].some(card => !card.used && card.type === this.troef)) {
      // Check whether someone else already played 'troef'.
      const score:number = this.cardsOfPlayers.map(cardsOfPlayer => cardsOfPlayer.find(card => card.moving && card.type === this.troef)?.score || 0).reduce((highestScore, score) => Math.max(highestScore, score), 0);
      if (this.cardsOfPlayers[playerNr].some(card => !card.used && card.type === this.troef && card.score > score)) {
        return this.cardsOfPlayers[playerNr].filter(card => !card.used && card.type === this.troef && card.score > score);
      }
    }
    return cards;
  }

  isCardDisabled(card: Card): boolean {
    if (card.moving) {
      return false;
    }
    if (this.player != this.Players[2] || this.numberOfPlayed === 4) {
      return true; // Disable all cards if it's not your turn
    }

    return !this.allowedCardsForPlayerInCurrentBattle(2).includes(card);
  }

  nextTurn() {
    switch (this.player) {
      case this.Players[0]:
        setTimeout(() => {
          const card: Card = this.allowedCardsForPlayerInCurrentBattle(0)[0];
          if (card) {
            card.x = this.offsetNorthX;
            card.y = this.offsetNorthY;
            card.moving = true;
            card.used = true;
            this.cardNorth = card;
          }
          this.nextPlayer();
          if (this.numberOfPlayed === 4) {
            this.endOfBattle();
          } else {
            this.nextTurn();
          }
        }, 1000);
        break;
      case this.Players[1]:
        setTimeout(() => {
          const card: Card = this.allowedCardsForPlayerInCurrentBattle(1)[0];
          if (card) {
            card.x = this.offsetEastX;
            card.y = this.offsetEastY;
            card.moving = true;
            card.used = true;
            this.cardEast = card;
          }
          this.nextPlayer();
          if (this.numberOfPlayed === 4) {
            this.endOfBattle();
          } else {
            // enable players cards
          }
        }, 1000);
        break;
      case this.Players[3]:
        setTimeout(() => {
          const card: Card = this.allowedCardsForPlayerInCurrentBattle(3)[0];
          if (card) {
            card.x = this.offsetWestX;
            card.y = this.offsetWestY;
            card.used = true;
            card.moving = true;
            this.cardWest = card;
          }
          this.nextPlayer();
          if (this.numberOfPlayed === 4) {
            this.endOfBattle();
          } else {
            this.nextTurn();
          }
        }, 1000);
        break;
    }
  }

  endOfBattle() {
    const winningCard: Card =
        this.cards.filter((card: Card) => card.moving)
            .map(card => this.calculatePoints(card))
            .reduce((highestScoreCard, currentCard) => currentCard.score > highestScoreCard.score ? currentCard : highestScoreCard);

    setTimeout(() => {
      const winnerNr: number =
          this.cardsOfPlayers[0].includes(winningCard) ? 0 : this.cardsOfPlayers[1].includes(winningCard) ? 1 : this.cardsOfPlayers[3].includes(winningCard) ? 3 : 2;

      const won = [this.placeholderNorthRect, this.placeholderEastRect, this.placeholderSouthRect, this.placeholderWestRect][winnerNr];
      if (this.cardNorth && this.cardEast && this.cardEast && this.cardSouth && this.cardWest) {
        this.cardNorth.x = won.left - this.placeholderNorthRect.left;
        this.cardNorth.y = won.top - this.placeholderNorthRect.top;
        this.cardEast.x = won.left - this.placeholderEastRect.left;
        this.cardEast.y = won.top - this.placeholderEastRect.top;
        this.cardSouth.x = won.left - this.placeholderSouthRect.left + this.offsetSouthX;
        this.cardSouth.y = won.top - this.placeholderPlayerRect.top;
        this.cardWest.x = won.left - this.placeholderWestRect.left;
        this.cardWest.y = won.top - this.placeholderWestRect.top;

        setTimeout(() => {
          // Todo: https://stackoverflow.com/questions/50908130/angular-5-add-style-to-specific-element-dynamically
          (this.elementRef.nativeElement.querySelector('#card-' + this.cardNorth?.id) as HTMLElement).style.visibility = 'hidden';
          (this.elementRef.nativeElement.querySelector('#card-' + this.cardEast?.id) as HTMLElement).style.visibility = 'hidden';
          (this.elementRef.nativeElement.querySelector('#card-' + this.cardSouth?.id) as HTMLElement).style.visibility = 'hidden';
          (this.elementRef.nativeElement.querySelector('#card-' + this.cardWest?.id) as HTMLElement).style.visibility = 'hidden';
        }, 700);
      }
      const totalScore = this.cards.filter((card: Card) => card.moving).map(card => this.calculatePoints(card).score).reduce((totalScore: number, cardScore) => totalScore + cardScore);
      if ([0,2].includes(winnerNr)) {
        this.scoreNorthSouth += totalScore;
      } else {
        this.scoreEastWest += totalScore;
      }

      this.player = this.Players[winnerNr];
      this.numberOfPlayed = 0;
      this.cards.forEach(c => c.moving = false);
      this.message = '';
      if (this.cardsOfPlayers[0].filter(card => !card.used).length == 0) {
        if (this.round > 3) {
          this.message = 'Game over';
        } else {
          this.round++;
          this.message = 'Start ronde #' + this.round;
          setTimeout(() => {
            this.startRound();
            this.nextTurn();
          }, 2000);
        }
      } else {
        this.nextTurn();
      }
    }, 3000);
  }

  private nextPlayer() {
    let playerIndex = this.Players.indexOf(this.player);
    playerIndex = playerIndex === 3 ? 0 : playerIndex + 1;
    this.player = this.Players[playerIndex];
    this.numberOfPlayed++;
  }

  private calculatePoints(card: Card): Card {
    let pointsArray: number[][] = [[0,0,0,10,2,3,4,11],[0,0,14,10,20,3,4,11]];
    card.score = pointsArray[card?.type == this.troef ? 1 : 0][(card?.value || 7) - 7];
    return card;
  }
}
