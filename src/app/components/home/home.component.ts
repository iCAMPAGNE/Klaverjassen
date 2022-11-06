import { Component, ElementRef, OnInit } from '@angular/core';
import {Card, SUIT} from "../../models/model";

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
  moveCard: boolean[] = [];
  offsetX: number = 0;
  offsetX2X: number = 0;
  offsetSY: number = 0;

  offsetNX: number = 0;
  offsetNY: number = 0;

  offsetEX: number = 0;
  offsetEY: number = 0;

  offsetWX: number = 0;
  offsetWY: number = 0;

  placeholderNorthRect: any;
  placeholderEastRect: any;
  placeholderSouthRect: any;
  placeholderWestRect: any;
  placeholderPlayerRect: any;

  cardNorth?: Card;
  cardEast?: Card;
  cardSouth?: Card;
  cardWest?: Card;


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
      this.offsetX =  placeholderSouth.left - this.placeholderPlayerRect.left;
      const secondSouthCard = this.elementRef.nativeElement.querySelector('.placeholder-player > .card-canvas:nth-child(2)').getBoundingClientRect();
      this.offsetX2X =  secondSouthCard.left - this.placeholderPlayerRect.left;
      this.offsetSY = placeholderSouth.top - placeholderS.top;

      this.placeholderNorthRect = this.elementRef.nativeElement.querySelector('.placeholder-n > .card-canvas:first-child').getBoundingClientRect();
      this.placeholderEastRect =  this.elementRef.nativeElement.querySelector('.placeholder-e').getBoundingClientRect();
      this.placeholderSouthRect = this.elementRef.nativeElement.querySelector('.placeholder-s > .card-canvas:first-child').getBoundingClientRect();
      this.placeholderWestRect =  this.elementRef.nativeElement.querySelector('.placeholder-w').getBoundingClientRect();

      this.offsetNX = this.elementRef.nativeElement.querySelector('.north').getBoundingClientRect().left - this.placeholderNorthRect.left;
      this.offsetNY = this.elementRef.nativeElement.querySelector('.north').getBoundingClientRect().top - this.placeholderNorthRect.top;

      this.offsetEX = this.elementRef.nativeElement.querySelector('.east').getBoundingClientRect().left - this.placeholderEastRect.left;
      this.offsetEY = this.elementRef.nativeElement.querySelector('.east').getBoundingClientRect().top - this.placeholderEastRect.top;

      this.offsetWX = this.elementRef.nativeElement.querySelector('.west').getBoundingClientRect().left - this.placeholderWestRect.left;
      this.offsetWY = this.elementRef.nativeElement.querySelector('.west').getBoundingClientRect().top - this.placeholderWestRect.top;
    }, 500);
  }


  cardClick(card: Card): boolean {
    if (this.player != this.Players[2]) {
      return false; // Only allowed when it's your turn
    }
//    if (card.type === this.troef) {
      this.moveCard[card.id] = true;
      card.x = this.offsetX;
      card.y = this.offsetSY;
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

  nextTurn() {
    switch (this.player) {
      case this.Players[0]:
        setTimeout(() => {
          const card: Card | undefined = this.cardsOfNorth.filter(c => !c.used)[0];
          if (card) {
            this.moveCard[card.id] = true;
            card.x = this.offsetNX;
            card.y = this.offsetNY;
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
            card.x = this.offsetEX;
            card.y = this.offsetEY;
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
            card.x = this.offsetWX;
            card.y = this.offsetWY;
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
        this.cardSouth.x = won.left - this.placeholderSouthRect.left + this.offsetX;
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
