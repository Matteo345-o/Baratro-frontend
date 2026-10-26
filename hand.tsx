
import { useEffect, useRef, useState } from 'react';
import { Card } from './src/game/logic';
import { PlayingCard } from './src/components/PlayingCard';

interface HandProps {
  hand: Card[];
  selectedCards: Card[];
  onToggleCard: (card: Card) => void;
  onPlay?: () => void;
  onDiscard?: () => void;
}

export const Hand = ({
  hand,
  selectedCards,
  onToggleCard,
  onPlay,
  onDiscard,
}: HandProps) => {
  // Gestione dinamica del roving tabindex (Requisito WAI-ARIA)
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (hand.length > 0) {
      setFocusedIndex((prevIndex) => {
        const nextIndex = Math.min(prevIndex, hand.length - 1);
        setTimeout(() => {
          cardRefs.current[nextIndex]?.focus();
        }, 50);
        return nextIndex;
      });
    }
  }, [hand]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number, card: Card) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % hand.length;
      setFocusedIndex(nextIndex);
      cardRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + hand.length) % hand.length;
      setFocusedIndex(prevIndex);
      cardRefs.current[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocusedIndex(0);
      cardRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      const lastIndex = hand.length - 1;
      setFocusedIndex(lastIndex);
      cardRefs.current[lastIndex]?.focus();
    } else if (e.key === ' ' || e.key === 'Enter') {
      // Requisito: Selezionare e deselezionare con Spazio
      e.preventDefault();
      onToggleCard(card);
    } else if (e.key.toLowerCase() === 'j' && onPlay) {
      e.preventDefault();
      onPlay();
    } else if (e.key.toLowerCase() === 's' && onDiscard) {
      e.preventDefault();
      onDiscard();
    }
  };

  return (
    <div
      role="listbox"
      aria-label="Le tue carte in mano"
      aria-multiselectable="true"
      aria-orientation="horizontal"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px',
      }}
    >
      {hand.map((card, index) => {
        const isSelected = selectedCards.some((c) => c.id === card.id);
        const isFocused = index === focusedIndex;

        return (
          <PlayingCard
            key={card.id}
            card={card}
            isSelected={isSelected}
            tabIndex={isFocused ? 0 : -1}
            cardRef={(el) => {
              cardRefs.current[index] = el;
            }}
            onKeyDown={(e) => handleKeyDown(e, index, card)}
            onSelect={(c) => {
              setFocusedIndex(index);
              onToggleCard(c);
            }}
          />
        );
      })}
    </div>
  );
};
