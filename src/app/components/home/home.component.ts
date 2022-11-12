import { Component, ElementRef, OnInit } from '@angular/core';
import {Card, SUIT, SUITS} from "../../models/model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
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
  troef: SUIT = SUIT.SPADES;
  troefSymbol: string = SUITS.SPADES.symbol;
  moveCard: boolean[] = [];
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


  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    Object.values(SUIT).forEach((suit:SUIT) => {
      for (let value = 7; value <= 14; value++) {
        const clubOrSpade: boolean = ['clubs', 'spades'].indexOf(suit) >= 0;
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
          clubOrSpade: clubOrSpade,
          pileNr: 5,
          searching: false,
          turning: false,
          turned: false,
          moving: false,
          used: false
        });
        this.spread.push(this.cards.length - 1);
      }
    });

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
    }, 500);
  }


  cardClick(card: Card): boolean {
    if (this.player != this.Players[2] || this.numberOfPlayed === 4) {
      return false; // Only allowed when it's your turn
    }
//    if (card.type === this.troef) {
      this.moveCard[card.id] = true;
      card.x = this.offsetSouthX;
      card.y = this.offsetSouthY;
      card.used = true;
      this.cardSouth = card;
    this.nextPlayer();
    if (this.numberOfPlayed === 4) {
      this.endOfRound();
    } else {
      this.nextTurn();
    }
    return true;
  }

  isCardDisabled(card: Card): boolean {
    if (!this.moveCard[card.id] && (this.player != this.Players[2] || this.numberOfPlayed === 4)) {
      return true;
    }
    if (this.placeholdersZ.every(c => c.used || c.type !== this.troef)) {
      return false;
    }
    return card.type !== this.troef;
  }

  nextTurn() {
    switch (this.player) {
      case this.Players[0]:
        setTimeout(() => {
          const card: Card | undefined = this.cardsOfNorth.filter(c => !c.used)[0];
          if (card) {
            this.moveCard[card.id] = true;
            card.x = this.offsetNorthX;
            card.y = this.offsetNorthY;
            card.used = true;
            this.cardNorth = card;
          }
          this.nextPlayer();
          if (this.numberOfPlayed === 4) {
            this.endOfRound();
          } else {
            this.nextTurn();
          }
        }, 1000);
        break;
      case this.Players[1]:
        setTimeout(() => {
          const card: Card | undefined = this.cardsOfEast.filter(c => !c.used)[0];
          if (card) {
            this.moveCard[card.id] = true;
            card.x = this.offsetEastX;
            card.y = this.offsetEastY;
            card.used = true;
            this.cardEast = card;
          }
          this.nextPlayer();
          if (this.numberOfPlayed === 4) {
            this.endOfRound();
          } else {
            // enable players cards
          }
        }, 1000);
        break;
      case this.Players[3]:
        setTimeout(() => {
          const card: Card | undefined = this.cardsOfWest.filter(c => !c.used)[0];
          if (card) {
            this.moveCard[card.id] = true;
            card.x = this.offsetWestX;
            card.y = this.offsetWestY;
            card.used = true;
            this.cardWest = card;
          }
          this.nextPlayer();
          if (this.numberOfPlayed === 4) {
            this.endOfRound();
          } else {
            this.nextTurn();
          }
        }, 1000);
        break;
    }
  }

  endOfRound() {
    setTimeout(() => {
      const winnerNr: number = Math.floor(Math.random() * 4);
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
      }
      this.player = this.Players[winnerNr];
      this.numberOfPlayed = 0;
      this.nextTurn();
    }, 2000);
  }

  private nextPlayer() {
    let playerIndex = this.Players.indexOf(this.player);
    playerIndex = playerIndex === 3 ? 0 : playerIndex + 1;
    this.player = this.Players[playerIndex];
    this.numberOfPlayed++;
  }

}
