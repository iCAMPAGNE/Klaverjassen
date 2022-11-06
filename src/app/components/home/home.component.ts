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
      const placeholderSouth = this.elementRef.nativeElement.querySelector('.south');
      const placeholderS = this.elementRef.nativeElement.querySelector('.placeholder-player');
      const firstSouthCard = this.elementRef.nativeElement.querySelectorAll('.placeholder-player > .card-canvas:first-child')[0];
      this.offsetX =  placeholderSouth.getBoundingClientRect().left - firstSouthCard.getBoundingClientRect().left;
      const secondSouthCard = this.elementRef.nativeElement.querySelectorAll('.placeholder-player > .card-canvas:nth-child(2)')[0];
      this.offsetX2X =  secondSouthCard.getBoundingClientRect().left - firstSouthCard.getBoundingClientRect().left;
      this.offsetSY = placeholderSouth.getBoundingClientRect().top - placeholderS.getBoundingClientRect().top;

      this.offsetNX = this.elementRef.nativeElement.querySelector('.north').getBoundingClientRect().left -
          this.elementRef.nativeElement.querySelector('.placeholder-n > .card-canvas:first-child').getBoundingClientRect().left;
      this.offsetNY = this.elementRef.nativeElement.querySelector('.north').getBoundingClientRect().top -
          this.elementRef.nativeElement.querySelector('.placeholder-n').getBoundingClientRect().top;

      this.offsetEX = this.elementRef.nativeElement.querySelector('.east').getBoundingClientRect().left -
          this.elementRef.nativeElement.querySelector('.placeholder-e').getBoundingClientRect().left;
      this.offsetEY = this.elementRef.nativeElement.querySelector('.east').getBoundingClientRect().top -
          this.elementRef.nativeElement.querySelector('.placeholder-e').getBoundingClientRect().top;

      this.offsetWX = this.elementRef.nativeElement.querySelector('.west').getBoundingClientRect().left -
          this.elementRef.nativeElement.querySelector('.placeholder-w').getBoundingClientRect().left;
      this.offsetWY = this.elementRef.nativeElement.querySelector('.west').getBoundingClientRect().top -
          this.elementRef.nativeElement.querySelector('.placeholder-w').getBoundingClientRect().top;

      this.placeholderNorthRect = this.elementRef.nativeElement.querySelector('.placeholder-n > .card-canvas:first-child').getBoundingClientRect();
      this.placeholderEastRect = this.elementRef.nativeElement.querySelector('.placeholder-e').getBoundingClientRect();
      this.placeholderSouthRect = this.elementRef.nativeElement.querySelector('.placeholder-s > .card-canvas:first-child').getBoundingClientRect();
      this.placeholderWestRect = this.elementRef.nativeElement.querySelector('.placeholder-w').getBoundingClientRect();

      this.placeholderPlayerRect = this.elementRef.nativeElement.querySelectorAll('.placeholder-player > .card-canvas:first-child')[0].getBoundingClientRect();
    }, 500);
  }


  cardClick(card: Card): boolean {
//    if (card.type === this.troef) {
      this.moveCard[card.id] = true;
      card.x = this.offsetX;
      card.y = this.offsetSY;
      card.used = true;
      this.cardSouth = card;
//      this.otherPlays(card);
    this.nextPlayer();
    if (this.numberOfPlayed === 4) {
      this.endOfRound();
    } else {
      this.nextTurn();
    }
//    }
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
//            this.nextTurn();
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
    console.log('endOfRound 0');
    setTimeout(() => {
      console.log('endOfRound 1');
      const winnerNr: number = Math.floor(Math.random() * 4);
      const won = [this.placeholderNorthRect, this.placeholderEastRect, this.placeholderSouthRect, this.placeholderWestRect][winnerNr];
      if (this.cardNorth && this.cardEast && this.cardEast && this.cardSouth && this.cardWest) {
        console.log('endOfRound 3', winnerNr);
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

  otherPlays(cardSouth: Card) {
    let cardNorth: Card;
    let cardEast: Card;
    let cardWest: Card;

    setTimeout(() => {
      const card: Card | undefined = this.cardsOfWest.filter(c => !c.used)[0];
      if (card) {
        this.moveCard[card.id] = true;
        card.x = this.offsetWX;
        card.y = this.offsetWY;
        card.used = true;
        cardWest = card;
      }
    }, 1000)
    setTimeout(() => {
      const card: Card | undefined = this.cardsOfNorth.filter(c => !c.used)[0];
      if (card) {
        this.moveCard[card.id] = true;
        card.x = this.offsetNX;
        card.y = this.offsetNY;
        card.used = true;
        cardNorth = card;
      }
    }, 2000)
    setTimeout(() => {
      const card: Card | undefined = this.cardsOfEast.filter(c => !c.used)[0];
      if (card) {
        this.moveCard[card.id] = true;
        card.x = this.offsetEX;
        card.y = this.offsetEY;
        card.used = true;
        cardEast = card;
      }
    }, 3000);

    setTimeout(() => {
      const won = [this.placeholderNorthRect, this.placeholderEastRect, this.placeholderSouthRect, this.placeholderWestRect][Math.floor(Math.random() * 4)];
      cardNorth.x = won.left - this.placeholderNorthRect.left;
      cardNorth.y = won.top - this.placeholderNorthRect.top;
      cardEast.x =  won.left - this.placeholderEastRect.left;
      cardEast.y =  won.top - this.placeholderEastRect.top;
      cardSouth.x = won.left - this.placeholderSouthRect.left + this.offsetX;
      cardSouth.y = won.top - this.placeholderPlayerRect.top;
      cardWest.x =  won.left - this.placeholderWestRect.left;
      cardWest.y =  won.top - this.placeholderWestRect.top;
    }, 5000);
  }

  private nextPlayer() {
    let playerIndex = this.Players.indexOf(this.player);
    playerIndex = playerIndex === 3 ? 0 : playerIndex + 1;
    this.player = this.Players[playerIndex];
    this.numberOfPlayed++;
  }

}
