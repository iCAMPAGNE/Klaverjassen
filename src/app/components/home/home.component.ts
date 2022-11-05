import { Component, ElementRef, OnInit } from '@angular/core';
import {Card, SUIT} from "../../models/model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
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
  offsetY: number = 0;

  offsetNX: number = 0;
  offsetNY: number = 0;

  offsetEX: number = 0;
  offsetEY: number = 0;

  offsetWX: number = 0;
  offsetWY: number = 0;

  offsetYnorth: number = 0;

  won: {x?:number, y?:number} = {};


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
          moving: false
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
      const placeholderNorth = this.elementRef.nativeElement.querySelector('.north');
      const placeholderSouth = this.elementRef.nativeElement.querySelector('.south');
      const placeholderN = this.elementRef.nativeElement.querySelector('.placeholder-n');
      const placeholderZ = this.elementRef.nativeElement.querySelector('.placeholder-z');
      const firstSouthCard = this.elementRef.nativeElement.querySelectorAll('.placeholder-z > .card-canvas:first-child')[0];
      this.offsetX =  placeholderSouth.getBoundingClientRect().left - firstSouthCard.getBoundingClientRect().left;
      const secondSouthCard = this.elementRef.nativeElement.querySelectorAll('.placeholder-z > .card-canvas:nth-child(2)')[0];
      this.offsetX2X =  secondSouthCard.getBoundingClientRect().left - firstSouthCard.getBoundingClientRect().left;
      this.offsetY = placeholderSouth.getBoundingClientRect().top - placeholderZ.getBoundingClientRect().top;

      this.offsetYnorth = placeholderNorth.getBoundingClientRect().top - placeholderN.getBoundingClientRect().top;

      this.offsetNX = this.elementRef.nativeElement.querySelector('.north').getBoundingClientRect().left -
          this.elementRef.nativeElement.querySelector('.placeholder-n').getBoundingClientRect().left;
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
    }, 500);
  }


  cardClick(card: Card): boolean {
//    if (card.type === this.troef) {
      this.moveCard[card.id] = true;
      this.otherPlays(card);
//    }
    return true;
  }

  play(starter: number) {
    for (let i: number = starter; i < starter + 4; i++) {
      setTimeout(() => {
        switch (i % 4) {
          case 0:
            break;
        }
      }, i * 1000);
    }
  };

  otherPlays(cardSouth: Card) {
    let cardNorth: Card;
    let cardEast: Card;
    let cardWest: Card;

    setTimeout(() => {
      const card: Card | undefined = this.cardsOfWest[this.cardsOfWest.length - 1];
      if (card) {
        this.moveCard[card.id] = true;
        cardWest = card;
      }
    }, 1000)
    setTimeout(() => {
      const card: Card | undefined = this.cardsOfNorth[this.cardsOfNorth.length - 1];
      if (card) {
        this.moveCard[card.id] = true;
        cardNorth = card;
      }
    }, 2000)
    setTimeout(() => {
      const card: Card | undefined = this.cardsOfEast[0];
      if (card) {
        this.moveCard[card.id] = true;
        cardEast = card;
      }
    }, 3000);

    setTimeout(() => {
      this.won = {x: 1, y: 1};
      cardNorth.x = 150 - this.elementRef.nativeElement.querySelector('.placeholder-n').getBoundingClientRect().left
      cardNorth.y = 750 - this.elementRef.nativeElement.querySelector('.placeholder-n').getBoundingClientRect().top;
      cardEast.x = 450 - this.elementRef.nativeElement.querySelector('.placeholder-e').getBoundingClientRect().left;
      cardEast.y = 750 - this.elementRef.nativeElement.querySelector('.placeholder-e').getBoundingClientRect().top;
      cardSouth.x = 450 - this.elementRef.nativeElement.querySelectorAll('.placeholder-z > .card-canvas:nth-child(4)')[0].left;
      cardSouth.y = 750 - this.elementRef.nativeElement.querySelector('.placeholder-z').getBoundingClientRect().top;
      cardWest.x = 450 - this.elementRef.nativeElement.querySelector('.placeholder-w').getBoundingClientRect().left;
      cardWest.y = 750 - this.elementRef.nativeElement.querySelector('.placeholder-w').getBoundingClientRect().top;
      // this.cardsOfNorth = this.cardsOfNorth.filter(c => c.id !== cardNorth.id);
      // this.cardsOfEast = this.cardsOfEast.filter(c => c.id !== cardEast.id);
      // this.placeholdersZ = this.placeholdersZ.filter(c => c.id !== cardSouth.id);
      // this.cardsOfWest = this.cardsOfWest.filter(c => c.id !== cardWest.id);
    }, 5000);
  }

}
