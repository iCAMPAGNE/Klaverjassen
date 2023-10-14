import {AfterViewInit, Component, ElementRef, HostListener, OnInit} from '@angular/core';
import {Card, SUIT} from "../../models/model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  showFullScreenButton: boolean = true;
  errorMessage: string = '';

  PlayerNames: string[] = ['Noord', 'Oost', 'Zuid', 'West'];
  roundPlayer: number = 2;
  battlePlayer: number = this.roundPlayer;
  numberOfPlayed: number = -2;

  cards: Card[] = [];
  cardsOfPlayers: Card[][] = [];
  trumpSuitNr: number = 0;
  trumpSymbol: string = SUIT[this.trumpSuitNr].symbol;
  SUITS = SUIT;

  playersPlay: boolean[] = new Array(4).fill(undefined);

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

  northSouthRoundScore: number = 0;
  eastWestRoundScore: number = 0;
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

  ngAfterViewInit(): void {
  };

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
          value: 0
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
    this.aksPlayOrPass();
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

  private aksPlayOrPass() {
    let playerNr:number = this.roundPlayer + 1;
    while (playerNr % 4 !== 2) {
      setTimeout((nr) => {
        this.playersPlay[nr % 4] = this.cardsOfPlayers[nr % 4].filter((card:Card) => card.suitNr === this.trumpSuitNr).length > 2;
      }, playerNr * 1000, playerNr);
      playerNr++;
    }
    setTimeout(() => {
      this.numberOfPlayed = -1;
    }, playerNr * 1000);
  }

  acceptTrump(play: boolean) {
    this.playersPlay[2] = play;
    let playerNr:number = 3;
    while (playerNr % 4 !== (this.roundPlayer + 1) % 4) {
      setTimeout((nr) => {
        this.playersPlay[nr % 4] = this.cardsOfPlayers[nr % 4].filter((card:Card) => card.suitNr === this.trumpSuitNr).length > 2;
      }, playerNr * 1000, playerNr);
      playerNr++;
    }
    setTimeout(() => {
      if (!this.playersPlay.some(playerPlay => playerPlay)) {
        if (this.roundPlayer == 2) {
          this.numberOfPlayed = -3;
        } else {
          this.trumpSuitNr = (this.trumpSuitNr + 1 + Math.floor(Math.random() * 3)) % 4;
          this.trumpSymbol = SUIT[this.trumpSuitNr].symbol;
          this.playersPlay = new Array(4).fill(undefined);
          this.cardsOfPlayers[2].sort((card1, card2) => this.sortCardsForPlayer(card1, card2));
          this.numberOfPlayed = 0;
          this.nextTurn();
        }
      } else {
        this.numberOfPlayed = 0;
        if (this.battlePlayer !== 2) {
          this.nextTurn();
        }
      }
    }, playerNr * 1000 + 100)
    this.numberOfPlayed = -2;
  }

  selectAnotherTrump(trumpNr: number) {
    this.trumpSuitNr = trumpNr;
    this.trumpSymbol = SUIT[trumpNr].symbol;
    this.cardsOfPlayers[2].sort((card1, card2) => this.sortCardsForPlayer(card1, card2));
    this.numberOfPlayed = 0;
  }

  cardClick(card: Card): boolean {
    card.x = this.offsetSouthX;
    card.y = this.offsetSouthY;
    card.used = true;
    card.moving = true;
    this.calculatePoints(card);
    this.cardSouth = card;
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
      // Check whether someone else already played 'troef'.
      const highestTroefScore:number = this.cardsOfPlayers.map(cardsOfPlayer => cardsOfPlayer.find(card => card.moving && card.suitNr === this.trumpSuitNr)?.value || 0).reduce((highestScore, score) => Math.max(highestScore, score), 0);
      if (highestTroefScore > 0) {
        // Someone played trump so check if you have trump-cards of higher value
        if (this.cardsOfPlayers[playerNr].some(card => !card.used && card.suitNr === this.trumpSuitNr && card.value > highestTroefScore)) {
          return this.cardsOfPlayers[playerNr].filter(card => !card.used && card.suitNr === this.trumpSuitNr && card.value > highestTroefScore);
        } else {
          // If not, all other cards (except trump) are allowed.
          return this.cardsOfPlayers[playerNr].filter(card => !card.used && card.suitNr !== this.trumpSuitNr);
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

  nextTurn() {
    switch (this.battlePlayer) {
      case 0:
        setTimeout(() => {
          const card: Card = this.allowedCardsForPlayerInCurrentBattle(0)[0];
          if (card) {
            card.x = this.offsetNorthX;
            card.y = this.offsetNorthY;
            card.moving = true;
            card.used = true;
            this.calculatePoints(card);
            this.cardNorth = card;
          } else {
            console.error('Player 0 has no allowed card in ', this.cardsOfPlayers[0]);
          }
          setTimeout(() => {
            this.cardsOfPlayers[0].sort((card1:Card) => card1.used ? -1 : 1);
            this.nextPlayer();
            if (this.numberOfPlayed === 4) {
              this.endOfBattle();
            } else {
              this.nextTurn();
            }
          }, 1000)
        }, 1000);
        break;
      case 1:
        setTimeout(() => {
          const card: Card = this.allowedCardsForPlayerInCurrentBattle(1)[0];
          if (card) {
            card.x = this.offsetEastX;
            card.y = this.offsetEastY;
            card.moving = true;
            card.used = true;
            this.calculatePoints(card);
            this.cardEast = card;
          } else {
            console.error('Player 1 has no allowed card in ', this.cardsOfPlayers[1]);
          }
          setTimeout(() => {
            this.cardsOfPlayers[1].sort((card1:Card) => card1.used ? -1 : 1);
            this.nextPlayer();
            if (this.numberOfPlayed === 4) {
              this.endOfBattle();
            } else {
              // enable players cards
            }
          }, 1000)
        }, 1000);
        break;
      case 3:
        setTimeout(() => {
          const card: Card = this.allowedCardsForPlayerInCurrentBattle(3)[0];
          if (card) {
            card.x = this.offsetWestX;
            card.y = this.offsetWestY;
            card.used = true;
            card.moving = true;
            this.calculatePoints(card);
            this.cardWest = card;
          } else {
            console.error('Player 3 has no allowed card in ', this.cardsOfPlayers[3]);
          }
          setTimeout(() => {
            this.cardsOfPlayers[3].sort((card1:Card) => card1.used ? -1 : 1);
            this.nextPlayer();
            if (this.numberOfPlayed === 4) {
              this.endOfBattle();
            } else {
              this.nextTurn();
            }
          }, 1000)
        }, 1000);
        break;
    }
  }

  endOfBattle() {
    let winnerPlayer:number = -1;
    const suitStarted:number = this.cardsOfPlayers[this.battlePlayer].find(card => card.moving)?.suitNr || 0; // because typescript sees ?.0 also as false
    if (suitStarted !== this.trumpSuitNr) {
      const playerWithHighestTrump: number[] = this.cardsOfPlayers.map((cardsOfPlayer, index) => [cardsOfPlayer.find(card => card.moving && card.suitNr === this.trumpSuitNr)?.value ?? -1, index]).sort((score1, score2) => score1[0] > score2[0] ? -1 : score1[0] == score2[0] && score1[1] == this.battlePlayer ? -1 : 1)[0];
      if (playerWithHighestTrump[0] >= 0) {
        winnerPlayer = playerWithHighestTrump[1];
      }
    }
    if (winnerPlayer < 0) {
      // Who has the card with the highest value with the same suit as the player who started the battle?
      const playerWithHighestSuit: number[] = this.cardsOfPlayers.map((cardsOfPlayer, index) => [cardsOfPlayer.find(card => card.moving && card.suitNr === suitStarted)?.value ?? -1, index]).sort((score1, score2) => score1[0] > score2[0] ? -1 : score1[0] == score2[0] && score1[1] == this.battlePlayer ? -1 : 1)[0];
      winnerPlayer = playerWithHighestSuit[1];
    }
    this.battleWinner = this.PlayerNames[winnerPlayer];
    let totalScore = this.cards.filter((card: Card) => card.moving).map(card => this.calculatePoints(card).value).reduce((totalScore: number, cardScore) => totalScore + cardScore);
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
    if (this.cardsOfPlayers[this.battlePlayer].find(card => card.moving)?.suitNr === this.trumpSuitNr && this.kudoScore > 0 && this.cards.filter((card: Card) => card.moving).some(card => card.nr === 12) && this.cards.filter((card: Card) => card.moving).some(card => card.nr === 13)) {
      this.kudoScore += 20;
    }

    setTimeout(() => {
      const won = [this.placeholderNorthRect, this.placeholderEastRect, this.placeholderSouthRect, this.placeholderWestRect][winnerPlayer];
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
      if ([0,2].includes(winnerPlayer)) {
        this.northSouthRoundScore += totalScore;
        this.northSouthRoundKudos += this.kudoScore;
      } else {
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
            this.roundWinnerText = 'Noord/Zuid hebben deze ronde gewonnen en krijgen hun behaalde punten: ' + (this.northSouthRoundScore + this.northSouthRoundKudos + (this.northSouthRoundScore >= 162 ? 100 : 0));
            this.roundWinnerText += '<br>en Oost/West krijgen hun ' + (this.eastWestRoundScore + this.eastWestRoundKudos) + ' punten.';
          } else {
            this.roundWinnerText = 'Oost/West heeft gewonnen en krijgt alle punten: ' + (this.northSouthRoundScore + this.northSouthRoundKudos + this.eastWestRoundScore + this.eastWestRoundKudos);
            // this.eastWestTotalScore += this.northSouthRoundScore + this.northSouthRoundKudos + this.eastWestRoundScore + this.eastWestRoundKudos;
          }
        } else {
          if (this.eastWestRoundScore + this.eastWestRoundKudos >= halfTotalScore + 1) {
            // this.northSouthTotalScore += this.northSouthRoundScore;
            // this.eastWestTotalScore += this.eastWestRoundScore + (this.eastWestRoundScore >= 162 ? 100 : 0);
            this.roundWinnerText = 'Oost/West heeft deze ronde gewonnen en krijgt hun behaalde punten: ' + (this.eastWestRoundScore + this.eastWestRoundKudos + (this.eastWestRoundScore >= 162 ? 100 : 0));
            this.roundWinnerText += '<br>en Noord/Zuid krijgen hun ' + (this.northSouthRoundScore + this.northSouthRoundKudos) + ' punten.';
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
              this.northSouthTotalScore += this.northSouthRoundScore + this.northSouthRoundKudos + (this.northSouthRoundScore >= 162 ? 100 : 0);
              this.eastWestTotalScore += this.eastWestRoundScore + this.eastWestRoundKudos;
              // this.roundWinner = 'Noord/Zuid';
            } else {
              // this.roundWinner = 'Oost/West';
              this.eastWestTotalScore += this.northSouthRoundScore + this.northSouthRoundKudos + this.eastWestRoundScore + this.eastWestRoundKudos;
            }
          } else {
            if (this.eastWestRoundScore + this.eastWestRoundKudos >= halfTotalScore + 1) {
              this.northSouthTotalScore += this.northSouthRoundScore + this.northSouthRoundKudos;
              this.eastWestTotalScore += this.eastWestRoundScore + this.eastWestRoundKudos + (this.eastWestRoundScore >= 162 ? 100 : 0);
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
            if (this.round >= 16) {
              this.battlePlayer = 2;
              this.playersPlay = new Array(4).fill(undefined);
              this.gameOver = true;
            } else {
              this.roundPlayer = (this.roundPlayer + 1) % 4;
              this.battlePlayer = this.roundPlayer;
              this.round++;
              this.trumpSuitNr = Math.floor(Math.random() * 4);
              this.trumpSymbol = SUIT[this.trumpSuitNr].symbol;
              this.playersPlay = new Array(4).fill(undefined);
              this.startRound();
            }
          }, 2000);
        }, 10000);
      } else {
        this.nextTurn();
      }
    }, 10000);
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

  private calculatePoints(card: Card): Card {
    let pointsArray: number[][] = [[0,0,0,10,2,3,4,11],[0,0,14,10,20,3,4,11]];
    card.value = pointsArray[card?.suitNr == this.trumpSuitNr ? 1 : 0][(card?.nr || 7) - 7];
    return card;
  }

  closeErrorPopup() {
    this.errorMessage = '';
  }
}
