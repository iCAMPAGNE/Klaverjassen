import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {Card, SUIT, SUITS} from "../../models/model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  Players: string[] = ['North', 'East', 'South', 'West'];
  player: string = this.Players[2];
  numberOfPlayed: number = 0;

  cards: Card[] = [];
  spread: number[] = [];
  nr: number = 0;
  cardsOfNorth: Card[] = [];
  cardsOfEast: Card[] = [];
  cardsOfWest: Card[] = [];
  placeholdersZ: Card[] = [];
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

    this.placeholdersZ = [];
    this.cardsOfNorth = [];
    this.cardsOfEast = [];
    this.cardsOfWest = [];
    for (let i = 0; i < 8; i++) {
      let spreadNr = Math.floor(Math.random() * this.spread.length);
      const card: Card = this.cards[this.spread[spreadNr]];
      this.placeholdersZ.push(card);
      this.spread.splice(spreadNr, 1);

      spreadNr = Math.floor(Math.random() * this.spread.length);
      this.cardsOfNorth.push(this.cards[this.spread[spreadNr]]);
      this.spread.splice(spreadNr, 1);
      spreadNr = Math.floor(Math.random() * this.spread.length);
      this.cardsOfEast.push(this.cards[this.spread[spreadNr]]);
      this.spread.splice(spreadNr, 1);
      spreadNr = Math.floor(Math.random() * this.spread.length);
      this.cardsOfWest.push(this.cards[this.spread[spreadNr]]);
      this.spread.splice(spreadNr, 1);
    }

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

    }, 1000)
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

  isCardDisabled(card: Card): boolean {
    if (card.moving) {
      return false;
    }
    if (this.player != this.Players[2] || this.numberOfPlayed === 4) {
      return true; // Disable all cards if it's not your turn
    }

    // If you start the round, every card is allowed
    if (this.numberOfPlayed === 0) {
      return false;
    }

    const suitPreviousPlayer: SUIT | undefined = this.cardsOfEast.find(c => c.moving)?.type;

    // If possible, use same suit as previous player
    if (card.type === suitPreviousPlayer) {
      return false;
    }

    // If player can't follow suit, try 'troef'
    if (this.placeholdersZ.every(c => c.used || c.type !== suitPreviousPlayer)) {
      if (card.type === this.troef) {
        return false;
      } else {
        if (this.placeholdersZ.every(c => c.used || c.type !== this.troef)) {
          return false;
        }
      }
    }
    // return card.type !== this.troef;

    return true;
  }

  nextTurn() {
    switch (this.player) {
      case this.Players[0]:
        setTimeout(() => {
          const card: Card | undefined = this.cardsOfNorth.filter(c => !c.used)[0];
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
          const card: Card | undefined = this.cardsOfEast.filter(c => !c.used)[0];
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
          const card: Card | undefined = this.cardsOfWest.filter(c => !c.used)[0];
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

    this.message = 'Punten:<br>'
        + 'North: ' + (this.cardNorth?.type == this.troef) + ', ' + (this.cardNorth?.value) + ': ' + (this.cardNorth ? this.calculatePoints(this.cardNorth).score : '') + '<br>'
        + 'East:  ' +  (this.cardEast?.type == this.troef) + ', ' + (this.cardEast?.value) + ': ' + (this.cardEast ? this.calculatePoints(this.cardEast).score : '') + '<br>'
        + 'South: ' +  (this.cardSouth?.type == this.troef) + ', ' + (this.cardSouth?.value) + ': ' + (this.cardSouth ? this.calculatePoints(this.cardSouth).score : '') + '<br>'
        + 'West:  ' +  (this.cardWest?.type == this.troef) + ', ' + (this.cardWest?.value) + ': ' + (this.cardWest ? this.calculatePoints(this.cardWest).score : '') + '<br>'
    ;
    setTimeout(() => {
      const winnerNr: number =
          this.cardsOfNorth.includes(winningCard) ? 0 : this.cardsOfEast.includes(winningCard) ? 1 : this.cardsOfWest.includes(winningCard) ? 3 : 2;

      const won = [this.placeholderNorthRect, this.placeholderEastRect, this.placeholderSouthRect, this.placeholderWestRect][winnerNr];
      if (this.cardNorth && this.cardEast && this.cardEast && this.cardSouth && this.cardWest) {
        this.cardNorth.x = won.left - this.placeholderNorthRect.left;
        this.cardNorth.y = won.top - this.placeholderNorthRect.top;
        this.cardEast.x = won.left - this.placeholderEastRect.left;
        this.cardEast.y = won.top - this.placeholderEastRect.top;
        this.cardSouth.x = won.left - this.placeholderSouthRect.left + this.offsetSouthX - 0.7*this.offsetSouthXdiff;
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
      this.message = 'Nog ' + this.cardsOfNorth.filter(card => !card.used).length;
      if (this.cardsOfNorth.filter(card => !card.used).length == 0) {
        if (++this.round > 3) {
          this.message = 'Game over';
        } else {
          this.message += ' startRound';
          setTimeout(() => {
            this.startRound();
          }, 2000);
        }
      }
      this.nextTurn();
    }, 5000);
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
