// src/game/logic.ts

export type Suit = 'Pianeti' | 'Stelle' | 'Comete' | 'Galassie';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number;
}

// Ordine gerarchico dei ranghi (per scale e ordinamento)
export const RANK_ORDER: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14,
};

// 1. Calcolo del valore in fiches della singola carta
export const getCardValue = (rank: Rank): number => {
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  if (rank === 'A') return 11;
  return parseInt(rank, 10);
};

// Nomi accessibili in italiano per lo screen reader (NVDA, VoiceOver)
export const RANK_NAMES: Record<Rank, string> = {
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  'J': 'Fante',
  'Q': 'Regina',
  'K': 'Re',
  'A': 'Asso',
};

// Simboli associati ai semi (non basati solo sul colore per accessibilità WCAG)
export const SUIT_SYMBOLS: Record<Suit, string> = {
  Pianeti: '🪐',
  Stelle: '⭐',
  Comete: '☄️',
  Galassie: '🌌',
};

// 2. Creazione e mescolamento del mazzo da 52 carte
export const createDeck = (): Card[] => {
  const suits: Suit[] = ['Pianeti', 'Stelle', 'Comete', 'Galassie'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        id: `${rank}-${suit}`,
        suit,
        rank,
        value: getCardValue(rank),
      });
    }
  }

  // Mescolamento Fisher-Yates
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

// Tabella dei punteggi base (Fiches e Moltiplicatore) secondo le regole ufficiali
export const SCORE_TABLE = {
  'Scala colore': { chips: 100, mult: 8 },
  Poker: { chips: 60, mult: 7 },
  Full: { chips: 40, mult: 4 },
  Colore: { chips: 35, mult: 4 },
  Scala: { chips: 30, mult: 4 },
  Tris: { chips: 30, mult: 3 },
  'Doppia coppia': { chips: 20, mult: 2 },
  Coppia: { chips: 10, mult: 2 },
  'Carta alta': { chips: 5, mult: 1 },
} as const;

export type ComboName = keyof typeof SCORE_TABLE;

// Utility per verificare se 5 carte formano una scala
const isStraight = (cards: Card[]): boolean => {
  if (cards.length !== 5) return false;
  const values = Array.from(new Set(cards.map((c) => RANK_ORDER[c.rank]))).sort((a, b) => a - b);
  if (values.length !== 5) return false;

  // Scala standard (es. 5, 6, 7, 8, 9 o 10, J, Q, K, A)
  const isNormalStraight = values[4] - values[0] === 4;
  if (isNormalStraight) return true;

  // Scala con Asso basso: A (14), 2, 3, 4, 5 -> valori [2, 3, 4, 5, 14]
  const isAceLowStraight =
    values[0] === 2 && values[1] === 3 && values[2] === 4 && values[3] === 5 && values[4] === 14;

  return isAceLowStraight;
};

// 3. Valutazione completa della combinazione pokeristica
// Ritorna il nome della combinazione e solo le carte che la compongono (utili per il calcolo fiches)
export const evaluateHand = (playedCards: Card[]): { combo: ComboName; validCards: Card[] } => {
  if (playedCards.length === 0) {
    return { combo: 'Carta alta', validCards: [] };
  }

  // Ordiniamo per valore gerarchico decrescente
  const sorted = [...playedCards].sort((a, b) => RANK_ORDER[b.rank] - RANK_ORDER[a.rank]);

  const counts: Record<string, number> = {};
  for (const card of sorted) {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  }

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const maxFreq = entries[0]?.[1] || 0;
  const secondFreq = entries[1]?.[1] || 0;

  const isFlush = sorted.length === 5 && sorted.every((c) => c.suit === sorted[0].suit);
  const straight = isStraight(sorted);

  // 1. Scala colore (5 carte consecutive dello stesso seme)
  if (isFlush && straight) {
    return { combo: 'Scala colore', validCards: sorted };
  }

  // 2. Poker (4 carte dello stesso rango)
  if (maxFreq === 4) {
    const pokerRank = entries[0][0];
    return {
      combo: 'Poker',
      validCards: sorted.filter((c) => c.rank === pokerRank),
    };
  }

  // 3. Full (Tris + Coppia, richiede 5 carte)
  if (maxFreq === 3 && secondFreq === 2) {
    return { combo: 'Full', validCards: sorted };
  }

  // 4. Colore (5 carte dello stesso seme)
  if (isFlush) {
    return { combo: 'Colore', validCards: sorted };
  }

  // 5. Scala (5 carte consecutive)
  if (straight) {
    return { combo: 'Scala', validCards: sorted };
  }

  // 6. Tris (3 carte dello stesso rango)
  if (maxFreq === 3) {
    const trisRank = entries[0][0];
    return {
      combo: 'Tris',
      validCards: sorted.filter((c) => c.rank === trisRank),
    };
  }

  // 7. Doppia coppia (due coppie distinte)
  if (maxFreq === 2 && secondFreq === 2) {
    const pairRanks = [entries[0][0], entries[1][0]];
    return {
      combo: 'Doppia coppia',
      validCards: sorted.filter((c) => pairRanks.includes(c.rank)),
    };
  }

  // 8. Coppia (una singola coppia)
  if (maxFreq === 2) {
    const pairRank = entries[0][0];
    return {
      combo: 'Coppia',
      validCards: sorted.filter((c) => c.rank === pairRank),
    };
  }

  // 9. Carta alta: conta solo la carta singola più alta
  return { combo: 'Carta alta', validCards: [sorted[0]] };
};

// 4. Calcolo del punteggio finale: (fiches base + valore carte valide) * moltiplicatore
export const calculateScore = (combo: ComboName, validCards: Card[]): number => {
  const { chips, mult } = SCORE_TABLE[combo];
  const cardsValue = validCards.reduce((sum, card) => sum + card.value, 0);
  return (chips + cardsValue) * mult;
};

// Funzioni per l'estensione Ordinamento
export const sortCardsByRank = (cards: Card[]): Card[] => {
  return [...cards].sort((a, b) => RANK_ORDER[b.rank] - RANK_ORDER[a.rank]);
};

export const sortCardsBySuit = (cards: Card[]): Card[] => {
  const suitOrder: Record<Suit, number> = {
    Pianeti: 1,
    Stelle: 2,
    Comete: 3,
    Galassie: 4,
  };
  return [...cards].sort((a, b) => {
    if (suitOrder[a.suit] !== suitOrder[b.suit]) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return RANK_ORDER[b.rank] - RANK_ORDER[a.rank];
  });
};
