// src/game/useGame.ts
import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  createDeck,
  evaluateHand,
  calculateScore,
  sortCardsByRank,
  sortCardsBySuit,
  ComboName,
} from './logic';

const ROUND_TARGETS = [300, 600, 1000];
const STORAGE_KEY = 'balatro_accessible_game_state_v1';

export type GameStatus = 'playing' | 'round_won' | 'game_won' | 'game_over';

interface SavedState {
  deck: Card[];
  hand: Card[];
  score: number;
  currentRound: number;
  handsLeft: number;
  discardsLeft: number;
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
  const [status, setStatus] = useState<GameStatus>('playing');
  const [lastCombo, setLastCombo] = useState<{ name: ComboName; points: number } | null>(null);

  // Annuncio per screen reader (aria-live polite)
  // Requisito slide 9: "Dopo ogni mano un annuncio: combinazione, punti ottenuti, punti mancanti all'obiettivo"
  const [announcement, setAnnouncement] = useState<string>('Benvenuto! Inizia la partita. Round 1: Obiettivo 300 punti.');

  const targetScore = ROUND_TARGETS[currentRound - 1] || 1000;

  // Inizializza o ripristina la partita salvata (Estensione Salvataggio, slide 6)
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
    setStatus('playing');
    setLastCombo(null);
    setAnnouncement('Nuova partita iniziata. Round 1 di 3. Obiettivo 300 punti. 8 carte in mano.');
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
          setStatus(parsed.status);
          setAnnouncement(`Partita ripresa al Round ${parsed.currentRound}. Punteggio attuale: ${parsed.score} su ${ROUND_TARGETS[parsed.currentRound - 1]}.`);
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
        status,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // Ignora errori di storage
    }
  }, [deck, hand, score, currentRound, handsLeft, discardsLeft, status]);

  // Selezione e deselezione delle carte (massimo 5 selezionabili)
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

  // Pesca nuove carte fino a ripristinare 8 carte in mano
  const drawCards = (cardsToRemove: Card[], currentHand: Card[], currentDeck: Card[]): { newHand: Card[]; newDeck: Card[] } => {
    const remainingHand = currentHand.filter((c) => !cardsToRemove.some((r) => r.id === c.id));
    const needed = 8 - remainingHand.length;

    let availableDeck = [...currentDeck];
    if (availableDeck.length < needed) {
      // Se il mazzo finisce, ne ricreiamo uno nuovo mescolato
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
    const pointsGained = calculateScore(combo, validCards);
    const newScore = score + pointsGained;
    const newHandsLeft = handsLeft - 1;

    setScore(newScore);
    setHandsLeft(newHandsLeft);
    setLastCombo({ name: combo, points: pointsGained });

    const { newHand, newDeck } = drawCards(selectedCards, hand, deck);
    setHand(newHand);
    setDeck(newDeck);
    setSelectedCards([]);

    // Verifica avanzamento round o vittoria/sconfitta
    if (newScore >= targetScore) {
      if (currentRound >= 3) {
        setStatus('game_won');
        setAnnouncement(
          `Combinazione: ${combo}! Punti ottenuti: ${pointsGained}. Totale: ${newScore}. VITTORIA FINALE! Hai superato tutti e 3 i round!`
        );
      } else {
        setStatus('round_won');
        setAnnouncement(
          `Combinazione: ${combo}! Punti ottenuti: ${pointsGained}. Totale: ${newScore} su ${targetScore}. ROUND ${currentRound} SUPERATO! Premi 'Prossimo Round' per continuare.`
        );
      }
    } else if (newHandsLeft <= 0) {
      setStatus('game_over');
      setAnnouncement(
        `Combinazione: ${combo}! Punti ottenuti: ${pointsGained}. Totale: ${newScore} su ${targetScore}. MANI ESAURITE: Partita persa!`
      );
    } else {
      const remaining = targetScore - newScore;
      setAnnouncement(
        `Combinazione: ${combo}. Punti ottenuti: ${pointsGained}. Totale: ${newScore}. Mancano ${remaining} punti all'obiettivo. Mani rimaste: ${newHandsLeft}.`
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

  // Passaggio al round successivo
  const nextRound = () => {
    if (currentRound >= 3) return;
    const nextR = currentRound + 1;
    setCurrentRound(nextR);
    setScore(0);
    setHandsLeft(4);
    setDiscardsLeft(3);
    setStatus('playing');
    setLastCombo(null);
    setSelectedCards([]);

    const newDeck = createDeck();
    const initialHand = newDeck.splice(0, 8);
    setDeck(newDeck);
    setHand(initialHand);

    setAnnouncement(`Iniziato Round ${nextR}. Obiettivo: ${ROUND_TARGETS[nextR - 1]} punti. 4 mani e 3 scarti disponibili.`);
  };

  // Estensione Ordinamento: ordina per valore (rank) o per seme (suit)
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
    status,
    lastCombo,
    announcement,
    toggleCardSelection,
    playHand,
    discardCards,
    sortHand,
    nextRound,
    resetGame: initGame,
  };
};
