
export interface Card {
    id: number;
    value: number;
    imageUrl: string;
    type: SUIT;
    clubOrSpade: boolean;
    pileNr: number;
    searching: boolean;
    turning: boolean;
    turned: boolean;
    moving: boolean;
}

export interface Pile {
    cards: Card[];
}

export enum SUIT {
    CLUBS = 'clubs',
    DIAMONDS = 'diamonds',
    SPADES = 'spades',
    HEARTS = 'hearts'
}
