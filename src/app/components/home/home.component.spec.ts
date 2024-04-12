import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { Card, SUIT } from "../../models/model";

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let id: number = 0;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    jasmine.clock().install(); // need to config __zone_symbol__fakeAsyncPatchLock flag before loading zone.js/testing
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clean errorMessage when closeErrorPopup is called', () => {
    component.errorMessage = "Error message";
    component.closeErrorPopup();

    expect(component.errorMessage).toBe('');
  });

  describe('allowedCardsForPlayerInCurrentBattle', () => {
    beforeEach(() => {
      component.battlePlayer = 2;
    })

    it('should allow any card for player if player is first one in battle (GameRule 1)', () => {
      component.numberOfPlayed = 0;
      const cards: Card[] = strs2cards(['♦7', '♥8', '♦B']);
      component.cardsOfPlayers[0] = strs2cards(['♦9', '♦10', '♦K']);
      component.cardsOfPlayers[1] = [];
      component.cardsOfPlayers[2] = cards;
      component.cardsOfPlayers[3] = [];

      cards.forEach(card => {
        expect(component.isCardDisabled(card)).toBeFalse();
      });
    });

    it('player should trump with higher value if first player plays trump (GameRule 2)', () => {
      const cards: Card[] = strs2cards(['♧7', '♧J', '♦10']);
      component.cardsOfPlayers[0] = strs2cards(['♧8', '♦10', '♦K']);
      component.cardsOfPlayers[1] = strs2cards(['♧K', '♦7', '♦Q']);
      component.cardsOfPlayers[1][0].moving = true;
      component.cardsOfPlayers[2] = cards;
      component.cardsOfPlayers[3] = strs2cards(['♧8', '♦7', '♧Q']);
      component.cards = [...component.cardsOfPlayers[0], ...component.cardsOfPlayers[1], ...component.cardsOfPlayers[2], ...component.cardsOfPlayers[3]];
      component.selectAnotherTrump(0); // Needed to fill card.value, but it also sorts the cards based on value!
      component.numberOfPlayed = 1;

      expect(component.isCardDisabled(component.cardsOfPlayers[2][0])).toBeFalse(); // ♧J > ♧K
      expect(component.isCardDisabled(component.cardsOfPlayers[2][1])).toBeTrue();  // ♧7 < ♧K
      expect(component.isCardDisabled(component.cardsOfPlayers[2][2])).toBeTrue();  // not trump
    });

    it('player should trump with higher value of all trump cards if first player plays trump (GameRule 2 #2)', () => {
      const cards: Card[] = strs2cards(['♤10', '♤J', '♦10']);
      component.cardsOfPlayers[0] = strs2cards(['♤9', '♦10', '♦7']);
      component.cardsOfPlayers[0][0].moving = true;
      component.cardsOfPlayers[1] = strs2cards(['♧A', '♦7', '♥Q']);
      component.cardsOfPlayers[1][0].moving = true;
      component.cardsOfPlayers[2] = cards;
      component.cardsOfPlayers[3] = strs2cards(['♤K', '♦Q', '♥9']);
      component.cardsOfPlayers[3][0].moving = true;
      component.cards = [...component.cardsOfPlayers[0], ...component.cardsOfPlayers[1], ...component.cardsOfPlayers[2], ...component.cardsOfPlayers[3]];
      component.selectAnotherTrump(2); // ♤ and it also sorts the cards based on value!
      component.numberOfPlayed = 3;

      expect(component.isCardDisabled(component.cardsOfPlayers[2][0])).toBeFalse(); // ♤J > ♤9
      expect(component.isCardDisabled(component.cardsOfPlayers[2][1])).toBeTrue();  // ♧10 < ♤9
    });

    it('player should trump with higher value of all trump cards if first player plays trump (GameRule 3)', () => {
      const cards: Card[] = strs2cards(['♤10', '♤9', '♦10']);
      component.cardsOfPlayers[0] = strs2cards(['♤A', '♦10', '♦7']);
      component.cardsOfPlayers[0][0].moving = true;
      component.cardsOfPlayers[1] = strs2cards(['♧J', '♦7', '♥Q']);
      component.cardsOfPlayers[1][0].moving = true;
      component.cardsOfPlayers[2] = cards;
      component.cardsOfPlayers[3] = strs2cards(['♤K', '♦Q', '♥A']);
      component.cardsOfPlayers[3][0].moving = true;
      component.cards = [...component.cardsOfPlayers[0], ...component.cardsOfPlayers[1], ...component.cardsOfPlayers[2], ...component.cardsOfPlayers[3]];
      component.selectAnotherTrump(2); // ♤ and it also sorts the cards based on value!
      component.numberOfPlayed = 1;

      expect(component.isCardDisabled(component.cardsOfPlayers[2][0])).toBeFalse();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][1])).toBeFalse();
    });

    it('player can use any card when no trump available and first player plays trump (GameRule 4)', () => {
      const cards: Card[] = strs2cards(['♥10', '♧9', '♦10']);
      component.cardsOfPlayers[0] = strs2cards(['♤A', '♦8', '♦7']);
      component.cardsOfPlayers[0][0].moving = true;
      component.cardsOfPlayers[1] = strs2cards(['♤J', '♦7', '♥Q']);
      component.cardsOfPlayers[1][0].moving = true;
      component.cardsOfPlayers[2] = cards;
      component.cardsOfPlayers[3] = strs2cards(['♤K', '♦Q', '♥A']);
      component.cardsOfPlayers[3][0].moving = true;
      component.cards = [...component.cardsOfPlayers[0], ...component.cardsOfPlayers[1], ...component.cardsOfPlayers[2], ...component.cardsOfPlayers[3]];
      component.selectAnotherTrump(2); // ♤ and it also sorts the cards based on value!
      component.numberOfPlayed = 1;

      expect(component.isCardDisabled(component.cardsOfPlayers[2][0])).toBeFalse();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][1])).toBeFalse();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][2])).toBeFalse();
    });

    it('player should follow suit of first player (GameRule 5)', () => {
      component.numberOfPlayed = 1;
      const cards: Card[] = strs2cards(['♧7', '♥8', '♦B']);
      component.cardsOfPlayers[0] = strs2cards(['♦9', '♦10', '♦K']);
      component.cardsOfPlayers[1] = strs2cards(['♦J', '♦K', '♦Q']);
      component.cardsOfPlayers[1][0].moving = true;
      component.cardsOfPlayers[2] = cards;
      component.cardsOfPlayers[3] = strs2cards(['♧8', '♦7', '♧Q']);

      expect(component.isCardDisabled(component.cardsOfPlayers[2][0])).toBeTrue();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][1])).toBeTrue();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][2])).toBeFalse();
    });

    it('player should follow suit of first player (GameRule 5) #2', () => {
      component.numberOfPlayed = 3;
      const cards: Card[] = strs2cards(['♧7', '♥8', '♦B']);
      component.cardsOfPlayers[0] = strs2cards(['♦9', '♦10', '♦K']);
      component.cardsOfPlayers[1] = strs2cards(['♦J', '♦K', '♦Q']);
      component.cardsOfPlayers[2] = cards;
      component.cardsOfPlayers[3] = strs2cards(['♧8', '♦7', '♧Q']);
      component.cardsOfPlayers[3][0].moving = true;

      expect(component.isCardDisabled(component.cardsOfPlayers[2][0])).toBeFalse();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][1])).toBeTrue();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][2])).toBeTrue();
    });

    it('if mate leads so far, every card is allowed (GameRule 6)', () => {
      const cards: Card[] = strs2cards(['♥7', '♥8', '♧9']);
      component.cardsOfPlayers[0] = strs2cards(['♦A', '♦10', '♦K']);
      component.cardsOfPlayers[0][0].moving = true;
      component.cardsOfPlayers[1] = strs2cards(['♦J', '♦K', '♦Q']);
      component.cardsOfPlayers[1][0].moving = true;
      component.cardsOfPlayers[2] = cards;
      component.cardsOfPlayers[3] = strs2cards(['♦8', '♦7', '♧Q']);
      component.cardsOfPlayers[3][0].moving = true;
      component.cards = [...component.cardsOfPlayers[0], ...component.cardsOfPlayers[1], ...component.cardsOfPlayers[2], ...component.cardsOfPlayers[3]];
      component.selectAnotherTrump(0); // Needed to fill in values also sorts the cards based on value!
      component.numberOfPlayed = 3;

      expect(component.isCardDisabled(component.cardsOfPlayers[2][0])).toBeFalse();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][1])).toBeFalse();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][2])).toBeFalse();
    });

    it("use trump with higher value so far if you don't have suit (GameRule 7.a)", () => {
      const cards: Card[] = strs2cards(['♥7', '♥8', '♧Q', '♧A']);
      component.cardsOfPlayers[0] = strs2cards(['♦7', '♦10', '♦K']);
      component.cardsOfPlayers[0][0].moving = true;
      component.cardsOfPlayers[1] = strs2cards(['♧K', '♦K', '♦Q']);
      component.cardsOfPlayers[1][0].moving = true;
      component.cardsOfPlayers[2] = cards;
      component.cardsOfPlayers[3] = strs2cards(['♦J', '♦7', '♧Q']);
      component.cardsOfPlayers[3][0].moving = true;
      component.cards = [...component.cardsOfPlayers[0], ...component.cardsOfPlayers[1], ...component.cardsOfPlayers[2], ...component.cardsOfPlayers[3]];
      component.selectAnotherTrump(0); // Needed to fill in values also sorts the cards based on value!
      component.numberOfPlayed = 3;

      expect(component.isCardDisabled(component.cardsOfPlayers[2][0])).toBeFalse();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][1])).toBeTrue();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][2])).toBeTrue();
    });

    it("use any trump if you don't have suit and no trump with higher value so far (GameRule 7.b)", () => {
      const cards: Card[] = strs2cards(['♥7', '♥8', '♧Q', '♧K']);
      component.cardsOfPlayers[0] = strs2cards(['♦7', '♦10', '♦K']);
      component.cardsOfPlayers[0][0].moving = true;
      component.cardsOfPlayers[1] = strs2cards(['♧8', '♦K', '♦Q']);
      component.cardsOfPlayers[1][0].moving = true;
      component.cardsOfPlayers[2] = cards;
      component.cardsOfPlayers[3] = strs2cards(['♦J', '♦7', '♧7']);
      component.cardsOfPlayers[3][0].moving = true;
      component.cards = [...component.cardsOfPlayers[0], ...component.cardsOfPlayers[1], ...component.cardsOfPlayers[2], ...component.cardsOfPlayers[3]];
      component.selectAnotherTrump(0); // Needed to fill in values also sorts the cards based on value!
      component.numberOfPlayed = 3;

      expect(component.isCardDisabled(component.cardsOfPlayers[2][0])).toBeFalse();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][1])).toBeFalse();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][2])).toBeTrue();
    });

    it("all cards are allowed when player doesn't have any suit or trump (GameRule 8)", () => {
      const cards: Card[] = strs2cards(['♥7', '♥8', '♥Q', '♥K', '♤A']);
      component.cardsOfPlayers[0] = strs2cards(['♦7', '♦10', '♦K']);
      component.cardsOfPlayers[0][0].moving = true;
      component.cardsOfPlayers[1] = strs2cards(['♧8', '♦K', '♦Q']);
      component.cardsOfPlayers[1][0].moving = true;
      component.cardsOfPlayers[2] = cards;
      component.cardsOfPlayers[3] = strs2cards(['♦J', '♦7', '♧7']);
      component.cardsOfPlayers[3][0].moving = true;
      component.cards = [...component.cardsOfPlayers[0], ...component.cardsOfPlayers[1], ...component.cardsOfPlayers[2], ...component.cardsOfPlayers[3]];
      component.selectAnotherTrump(0); // Needed to fill in values also sorts the cards based on value!
      component.numberOfPlayed = 3;

      expect(component.isCardDisabled(component.cardsOfPlayers[2][0])).toBeFalse();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][1])).toBeFalse();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][2])).toBeFalse();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][3])).toBeFalse();
      expect(component.isCardDisabled(component.cardsOfPlayers[2][4])).toBeFalse();
    });

    it('should allow always last card for player', () => {
      component.numberOfPlayed = 0;
      component.cardsOfPlayers[0] = strs2cards(['♦9']);
      component.cardsOfPlayers[1] = [];
      component.cardsOfPlayers[2] = strs2cards(['♥8']);
      component.cardsOfPlayers[3] = [];

      expect(component.isCardDisabled(component.cardsOfPlayers[2][0])).toBeFalse();
      expect(component.isCardDisabled(component.cardsOfPlayers[0][0])).toBeTrue();
    });
  });

  describe('bestGuessCard', () => {
    beforeEach(() => {
      component.battlePlayer = 0;
    })

    it('Is turn on (first) player? Check if player has trump cards and use the card with the highest value', () => {
      const cards: Card[] = strs2cards(['♥7', '♥8', '♥Q', '♥K', '♤A']);
      component.cardsOfPlayers[0] = strs2cards(['♦7', '♦10', '♦K', '♧Q', '♧K', '♧A']);
      component.cardsOfPlayers[1] = strs2cards(['♦K', '♧8', '♦Q']);
      component.cardsOfPlayers[2] = cards;
      component.cardsOfPlayers[3] = strs2cards(['♦J', '♦7', '♧7']);
      component.cards = [...component.cardsOfPlayers[0], ...component.cardsOfPlayers[1], ...component.cardsOfPlayers[2], ...component.cardsOfPlayers[3]];
      component.numberOfPlayed = 0;

      component.nextTurn();
      jasmine.clock().tick(12000);

      expect(component.cardsOfPlayers[0][0].moving).toBeTrue();
      expect(component.cardsOfPlayers[1][0].moving).toBeTrue();
    });

    it("If mate started the battle and is in the lead without trump, don't overrule", () => {
      component.cardsOfPlayers[3] = strs2cards(['♦Q']);
      component.cardsOfPlayers[3][0].moving = true;
      component.cardsOfPlayers[0] = strs2cards(['♥7', '♥10', '♧Q', '♧K', '♦J', '♧A']);
      component.cardsOfPlayers[1] = strs2cards(['♦K', '♥8', '♦9', '♦A', '♥A', '♧J']);
      component.cardsOfPlayers[2] = [];
      component.cards = [...component.cardsOfPlayers[0], ...component.cardsOfPlayers[1], ...component.cardsOfPlayers[2], ...component.cardsOfPlayers[3]];
      component.numberOfPlayed = 1;

      component.nextTurn();
      jasmine.clock().tick(12000);
      showMovingCards(component.battlePlayer);

      expect(cardTypeOfPlayer(0)).toBe('♦J');
      expect(cardTypeOfPlayer(1)).toBe('♦9');
    });

    it("If mate started the battle and is in the lead without trump, don't overrule with trump", () => {
      component.cardsOfPlayers[3] = strs2cards(['♦Q']);
      component.cardsOfPlayers[3][0].moving = true;
      component.cardsOfPlayers[0] = strs2cards(['♥7', '♥10', '♧Q', '♧K', '♦J', '♧A']);
      component.cardsOfPlayers[1] = strs2cards(['♥K', '♥8', '♥9', '♤A', '♥A', '♧J']);
      component.cardsOfPlayers[2] = [];
      component.cards = [...component.cardsOfPlayers[0], ...component.cardsOfPlayers[1], ...component.cardsOfPlayers[2], ...component.cardsOfPlayers[3]];
      component.numberOfPlayed = 1;

      component.nextTurn();
      jasmine.clock().tick(11500);
      showMovingCards(component.battlePlayer);

      expect(cardTypeOfPlayer(0)).toBe('♦J');
      expect(cardTypeOfPlayer(1)).toBe('♥8');
    });

    it("If mate started the battle and is in the lead with no trump and player only has trump, choose lowest one", () => {
      component.cardsOfPlayers[3] = strs2cards(['♦Q']);
      component.cardsOfPlayers[3][0].moving = true;
      component.cardsOfPlayers[0] = strs2cards(['♥7', '♥10', '♤Q', '♦J', '♤A']);
      component.cardsOfPlayers[1] = strs2cards(['♧K', '♧J', '♧8', '♧9', '♧A']);
      component.cardsOfPlayers[2] = [];
      component.cards = [...component.cardsOfPlayers[0], ...component.cardsOfPlayers[1], ...component.cardsOfPlayers[2], ...component.cardsOfPlayers[3]];
      component.numberOfPlayed = 1;

      component.nextTurn();
      jasmine.clock().tick(12000);
      showMovingCards(component.battlePlayer);

      expect(cardTypeOfPlayer(0)).toBe('♦J');
      expect(cardTypeOfPlayer(1)).toBe('♧8');
    });

    it("If mate didn't start battle but is in the lead without trump, don't overrule without trump", () => {
      component.battlePlayer = 3;
      component.cardsOfPlayers[2] = strs2cards(['♦Q']);
      component.cardsOfPlayers[2][0].moving = true;
      component.cardsOfPlayers[3] = strs2cards(['♥7', '♥10', '♧Q', '♧K', '♦J', '♦10']);
      component.cardsOfPlayers[0] = strs2cards(['♦7']);
      component.cardsOfPlayers[1] = strs2cards(['♦K', '♥8', '♦9', '♦A', '♥A', '♧J']);
      component.cards = [...component.cardsOfPlayers[0], ...component.cardsOfPlayers[1], ...component.cardsOfPlayers[2], ...component.cardsOfPlayers[3]];
      component.numberOfPlayed = 1;

      component.nextTurn();
      jasmine.clock().tick(13000);
      showMovingCards(2);

      expect(cardTypeOfPlayer(1)).toBe('♦9');
    });
  });

  function cardTypeOfPlayer(player: number) {
    const card: Card = component.cardsOfPlayers[player][0];
    return SUIT[card.suitNr].symbol+cardNr2Type(card.nr)
  }

  function showMovingCards(battlePlayer: number) {
    console.log(`Trump: ${SUIT[component.trumpSuitNr].symbol}, battlePlayer is ${battlePlayer}`)
    for(let playerNr = battlePlayer; playerNr <= battlePlayer + 3; playerNr++) {
      const playerCards = component.cardsOfPlayers[playerNr % 4];
      playerCards.forEach((playerCard, index) => {
        if (playerCard.moving) {
          console.log(`${playerNr % 4}: [${index}] ${SUIT[playerCard.suitNr].symbol}${cardNr2Type(playerCard.nr).padEnd(2, ' ')}  ` + playerCard.value);
        }
      });
    }
  }

  function strs2cards(cardsStrings: string[]): Card[] {
    return cardsStrings.map(cardString => convertStringToCard(cardString));
  }

  function convertStringToCard(cardString: string): Card {
    const suitNr: number = SUIT.findIndex(s => s.symbol === cardString.charAt(0));
    const nr: number = CARD_NUMBERS.findIndex(n => n === cardString.substring(1)) + 7;
    return createCard(nr, suitNr);
  }

  function cardNr2Type(nr:number): string {
    return CARD_NUMBERS[nr - 7];
  }

  function createCard(nr: number, suitNr: number): Card {
    return {
      id: id++,
      nr: nr,
      imageUrl: '',
      suitNr: suitNr,
      moving: false,
      used: false,
      value: component.valueArray[suitNr == component.trumpSuitNr ? 1 : 0][(nr || 7) - 7]
    }
  }

  const CARD_NUMBERS: string[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
});
