
export interface Card {
    id: number;
    nr: number;
    imageUrl: string;
    suitNr: number;
    moving: boolean;
    x?: number;
    y?: number;
    used: boolean;
    value: number;
}

export interface Pile {
    cards: Card[];
}

export const SUIT = [
    { name: 'clubs', symbol: '♧'},
    { name: 'diamonds', symbol: '♦'},
    { name: 'spades', symbol: '♤'},
    { name: 'hearts', symbol: '♥'}
]
