// src/game/useGame.ts
import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  createDeck,
  evaluateHand,
  calculateScoreWithJokers,
  sortCardsByRank,
  sortCardsBySuit,
  Joker,
  ALL_JOKERS,
  ScoreBreakdown,
} from './logic';

const ROUND_TARGETS = [300, 600, 1000];
const STORAGE_KEY = 'stellaris_accessible_game_state_v1';

export type GameStatus = 'playing' | 'round_won' | 'shop' | 'game_won' | 'game_over';

interface SavedState {
  deck: Card[];
  hand: Card[];
  score: number;
  currentRound: number;
  handsLeft: number;
  discardsLeft: number;
  money: number;
  jokers: Joker[];
  status: GameStatus;
}

export const useGame = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [score, setScore] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [handsLeft, setHandsLeft] = useState<number>(4);
  const [discardsLeft, setDiscardsLeft] = useState<number>(3);
  const [money, setMoney] = useState<number>(4); // Soldi di partenza: $4
  const [jokers, setJokers] = useState<Joker[]>([]); // Massimo 5 slot per i Jolly
  const [status, setStatus] = useState<GameStatus>('playing');
  const [lastScoreBreakdown, setLastScoreBreakdown] = useState<ScoreBreakdown | null>(null);

  // Annuncio per screen reader (aria-live polite)
  const [announcement, setAnnouncement] = useState<string>(
    'Benvenuto a Stellaris! Inizia la partita. Round 1: Obiettivo 300 punti. 8 carte in mano.'
  );

  const targetScore = ROUND_TARGETS[currentRound - 1] || 1000;

  // Inizializza la partita
  const initGame = useCallback(() => {
    const newDeck = createDeck();
    const initialHand = newDeck.splice(0, 8);
    setDeck(newDeck);
    setHand(initialHand);
    setSelectedCards([]);
    setScore(0);
    setCurrentRound(1);
    setHandsLeft(4);
    setDiscardsLeft(3);
    setMoney(4);
    setJokers([]);
    setStatus('playing');
    setLastScoreBreakdown(null);
    setAnnouncement('Nuova partita iniziata. Round 1 di 3. Obiettivo 300 punti. $4 nel portafoglio.');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignora errori di storage
    }
  }, []);

  // Avvio o ripristino da localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: SavedState = JSON.parse(saved);
        if (parsed && parsed.hand && parsed.hand.length > 0) {
          setDeck(parsed.deck);
          setHand(parsed.hand);
          setScore(parsed.score);
          setCurrentRound(parsed.currentRound);
          setHandsLeft(parsed.handsLeft);
          setDiscardsLeft(parsed.discardsLeft);
          setMoney(parsed.money ?? 4);
          setJokers(parsed.jokers ?? []);
          setStatus(parsed.status);
          setAnnouncement(
            `Partita ripresa al Round ${parsed.currentRound}. Punteggio attuale: ${parsed.score} su ${ROUND_TARGETS[parsed.currentRound - 1]}. Soldi: $${parsed.money ?? 4}.`
          );
          return;
        }
      }
    } catch {
      // Fallback
    }
    initGame();
  }, [initGame]);

  // Salvataggio automatico dello stato
  useEffect(() => {
    if (hand.length === 0) return;
    try {
      const stateToSave: SavedState = {
        deck,
        hand,
        score,
        currentRound,
        handsLeft,
        discardsLeft,
        money,
        jokers,
        status,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // Ignora errori di storage
    }
  }, [deck, hand, score, currentRound, handsLeft, discardsLeft, money, jokers, status]);

  // Selezione e deselezione delle carte (massimo 5)
  const toggleCardSelection = (card: Card) => {
    if (status !== 'playing') return;

    setSelectedCards((prev) => {
      const alreadySelected = prev.some((c) => c.id === card.id);
      if (alreadySelected) {
        return prev.filter((c) => c.id !== card.id);
      }
      if (prev.length >= 5) {
        setAnnouncement('Puoi selezionare al massimo 5 carte contemporaneamente.');
        return prev;
      }
      return [...prev, card];
    });
  };

  // Pesca nuove carte fino a 8 carte in mano
  const drawCards = (
    cardsToRemove: Card[],
    currentHand: Card[],
    currentDeck: Card[]
  ): { newHand: Card[]; newDeck: Card[] } => {
    const remainingHand = currentHand.filter((c) => !cardsToRemove.some((r) => r.id === c.id));
    const needed = 8 - remainingHand.length;

    let availableDeck = [...currentDeck];
    if (availableDeck.length < needed) {
      availableDeck = [...availableDeck, ...createDeck()];
    }

    const drawn = availableDeck.splice(0, needed);
    return {
      newHand: [...remainingHand, ...drawn],
      newDeck: availableDeck,
    };
  };

  // Gioca mano (1-5 carte)
  const playHand = () => {
    if (status !== 'playing') return;
    if (selectedCards.length < 1 || selectedCards.length > 5 || handsLeft <= 0) {
      setAnnouncement('Seleziona da 1 a 5 carte prima di giocare.');
      return;
    }

    const { combo, validCards } = evaluateHand(selectedCards);
    const breakdown = calculateScoreWithJokers(combo, validCards, jokers);
    const pointsGained = breakdown.finalScore;
    const newScore = score + pointsGained;
    const newHandsLeft = handsLeft - 1;

    setScore(newScore);
    setHandsLeft(newHandsLeft);
    setLastScoreBreakdown(breakdown);

    const { newHand, newDeck } = drawCards(selectedCards, hand, deck);
    setHand(newHand);
    setDeck(newDeck);
    setSelectedCards([]);

    // Verifica superamento round o sconfitta
    if (newScore >= targetScore) {
      if (currentRound >= 3) {
        setStatus('game_won');
        setAnnouncement(
          `Combinazione: ${combo}! Punti: +${pointsGained}. Totale: ${newScore}. VITTORIA FINALE! Hai superato tutti e 3 i round!`
        );
      } else {
        // Guadagno denaro: $4 base + $1 per ogni mano rimasta (meccanica Balatro)
        const earnedMoney = 4 + newHandsLeft;
        setMoney((m) => m + earnedMoney);
        setStatus('round_won');
        setAnnouncement(
          `Combinazione: ${combo}! Punti: +${pointsGained}. Totale: ${newScore} su ${targetScore}. Round ${currentRound} superato! Guadagnati $${earnedMoney}. Entra nel Negozio per comprare Jolly.`
        );
      }
    } else if (newHandsLeft <= 0) {
      setStatus('game_over');
      setAnnouncement(
        `Combinazione: ${combo}! Punti: +${pointsGained}. Totale: ${newScore} su ${targetScore}. Mani esaurite: Partita persa!`
      );
    } else {
      const remaining = targetScore - newScore;
      setAnnouncement(
        `Combinazione: ${combo}. Punti ottenuti: ${pointsGained} (${breakdown.totalChips} fiches × ${breakdown.totalMult} mult). Totale: ${newScore}. Mancano ${remaining} punti. Mani rimaste: ${newHandsLeft}.`
      );
    }
  };

  // Scarta carte (1-5 carte)
  const discardCards = () => {
    if (status !== 'playing') return;
    if (selectedCards.length < 1 || selectedCards.length > 5 || discardsLeft <= 0) {
      setAnnouncement(
        discardsLeft <= 0
          ? 'Hai esaurito gli scarti per questo round.'
          : 'Seleziona da 1 a 5 carte da scartare.'
      );
      return;
    }

    const count = selectedCards.length;
    const newDiscardsLeft = discardsLeft - 1;
    setDiscardsLeft(newDiscardsLeft);

    const { newHand, newDeck } = drawCards(selectedCards, hand, deck);
    setHand(newHand);
    setDeck(newDeck);
    setSelectedCards([]);

    setAnnouncement(`Scartate ${count} carte. Scarti rimanenti: ${newDiscardsLeft}.`);
  };

  // Entra nel Negozio tra un round e l'altro
  const openShop = () => {
    setStatus('shop');
    setAnnouncement(`Benvenuto nel Negozio Spaziale! Saldo disponibile: $${money}. Puoi comprare fino a 5 Jolly.`);
  };

  // Acquista un Jolly dal Negozio
  const buyJoker = (joker: Joker) => {
    if (money < joker.cost) {
      setAnnouncement(`Fondi insufficienti per ${joker.name}. Servono $${joker.cost}, hai $${money}.`);
      return false;
    }
    if (jokers.length >= 5) {
      setAnnouncement('Slot Jolly pieni! Puoi equipaggiare al massimo 5 Jolly contemporaneamente.');
      return false;
    }
    if (jokers.some((j) => j.id === joker.id)) {
      setAnnouncement(`Possiedi già il Jolly ${joker.name}.`);
      return false;
    }

    setMoney((m) => m - joker.cost);
    setJokers((prev) => [...prev, joker]);
    setAnnouncement(`Acquistato ${joker.name} per $${joker.cost}! Saldo residuo: $${money - joker.cost}.`);
    return true;
  };

  // Vendi un Jolly equipaggiato
  const sellJoker = (jokerId: string) => {
    const joker = jokers.find((j) => j.id === jokerId);
    if (!joker) return;

    const sellPrice = Math.max(1, Math.floor(joker.cost / 2));
    setMoney((m) => m + sellPrice);
    setJokers((prev) => prev.filter((j) => j.id !== jokerId));
    setAnnouncement(`Venduto ${joker.name} per $${sellPrice}. Nuovo saldo: $${money + sellPrice}.`);
  };

  // Passaggio al round successivo dal Negozio
  const startNextRound = () => {
    if (currentRound >= 3) return;
    const nextR = currentRound + 1;
    setCurrentRound(nextR);
    setScore(0);
    setHandsLeft(4);
    setDiscardsLeft(3);
    setStatus('playing');
    setLastScoreBreakdown(null);
    setSelectedCards([]);

    const newDeck = createDeck();
    const initialHand = newDeck.splice(0, 8);
    setDeck(newDeck);
    setHand(initialHand);

    setAnnouncement(
      `Iniziato Round ${nextR} di 3. Obiettivo: ${ROUND_TARGETS[nextR - 1]} punti. 4 mani e 3 scarti disponibili. Jolly attivi: ${jokers.length}.`
    );
  };

  // Ordinamento: per valore o per seme
  const sortHand = (by: 'rank' | 'suit') => {
    if (by === 'rank') {
      setHand(sortCardsByRank(hand));
      setAnnouncement('Mano ordinata per valore decrescente.');
    } else {
      setHand(sortCardsBySuit(hand));
      setAnnouncement('Mano ordinata per seme.');
    }
  };

  return {
    hand,
    selectedCards,
    score,
    targetScore,
    currentRound,
    handsLeft,
    discardsLeft,
    money,
    jokers,
    allShopJokers: ALL_JOKERS,
    status,
    lastScoreBreakdown,
    announcement,
    toggleCardSelection,
    playHand,
    discardCards,
    sortHand,
    openShop,
    buyJoker,
    sellJoker,
    startNextRound,
    resetGame: initGame,
  };
};
