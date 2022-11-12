
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
    x?: number;
    y?: number;
    used: boolean;
}

export interface Pile {
    cards: Card[];
}


export const SUITS = {
    CLUBS: { name: 'clubs', symbol: '♧'},
    DIAMONDS: { name:  'diamonds', symbol: '♦'},
    SPADES: { name: 'spades', symbol: '♤'},
    HEARTS: { name: 'hearts', symbol: '♥'}
};

export enum SUIT {
    CLUBS = 'clubs',
    DIAMONDS = 'diamonds',
    SPADES = 'spades',
    HEARTS = 'hearts'
}
