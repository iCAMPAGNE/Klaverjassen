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
  placeholdersZ: Card[] = [];
  troef: SUIT = SUIT.SPADES;
  moveCard: boolean[] = [];
  offsetX: number = 0;
  offsetX2X: number = 0;
  offsetY: number = 0;

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    Object.values(SUIT).forEach((suit:SUIT) => {
      for (let value = 7; value <= 13; value++) {
        const clubOrSpade: boolean = ['clubs', 'spades'].indexOf(suit) >= 0;
        let imageUrl = 'assets/img/';
        switch (value) {
          case 1:
            imageUrl += 'ace_of_' + suit;
            break;
          case 11:
            imageUrl += 'jack_of_' + suit;
            break;
          case 12:
            imageUrl += 'queen_of_' + suit;
            break;
          case 13:
            imageUrl += 'king_of_' + suit;
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
      const spreadNr = Math.floor(Math.random() * this.spread.length);
      const card: Card = this.cards[this.spread[spreadNr]];
      this.placeholdersZ.push(card);
      this.spread.splice(spreadNr, 1);
    }

    setTimeout(() => {
      const placeholderSouth = this.elementRef.nativeElement.querySelector('.south');
      const placeholderZ = this.elementRef.nativeElement.querySelector('.placeholder-z');
      const firstSouthCard = this.elementRef.nativeElement.querySelectorAll('.card-canvas:first-child')[0];
      this.offsetX =  placeholderSouth.getBoundingClientRect().left - firstSouthCard.getBoundingClientRect().left;
      const secondSouthCard = this.elementRef.nativeElement.querySelectorAll('.card-canvas:nth-child(2)')[0];
      this.offsetX2X =  secondSouthCard.getBoundingClientRect().left - firstSouthCard.getBoundingClientRect().left;
      this.offsetY = placeholderSouth.getBoundingClientRect().top - placeholderZ.getBoundingClientRect().top;
    }, 500);
  }


  cardClick(card: Card): boolean {
    this.moveCard[card.id] = true;
    return true;
  }

}
