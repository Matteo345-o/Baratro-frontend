// src/components/PlayingCard.tsx
import React from 'react';
import { Card, RANK_NAMES, SUIT_SYMBOLS } from '../game/logic';

interface PlayingCardProps {
  card: Card;
  isSelected: boolean;
  tabIndex: number;
  onSelect: (card: Card) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  cardRef?: (node: HTMLDivElement | null) => void;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isSelected,
  tabIndex,
  onSelect,
  onKeyDown,
  cardRef,
}) => {
  const readableRank = RANK_NAMES[card.rank] || card.rank;
  const ariaLabel = `${readableRank} di ${card.suit}, valore ${card.value}${
    isSelected ? ', selezionata' : ', non selezionata'
  }`;

  return (
    <div
      ref={cardRef}
      role="option"
      aria-selected={isSelected}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      onClick={() => onSelect(card)}
      className={`card ${isSelected ? 'selected' : ''}`}
      style={{
        border: isSelected ? '3px solid #66fcf1' : '2px solid #45a29e',
        transform: isSelected ? 'translateY(-16px)' : 'translateY(0)',
        padding: '12px 10px',
        margin: '6px',
        borderRadius: '12px',
        background: isSelected ? '#1f2833' : '#0b0c10',
        color: '#ffffff',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '88px',
        height: '132px',
        minWidth: '44px',
        minHeight: '44px',
        transition: 'transform 0.15s cubic-bezier(0.2, 0, 0, 1), border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
        userSelect: 'none',
        boxShadow: isSelected
          ? '0 12px 24px rgba(0, 0, 0, 0.5), 0 0 15px rgba(102, 252, 241, 0.6)'
          : '0 4px 8px rgba(0, 0, 0, 0.35)',
        boxSizing: 'border-box',
      }}
    >
      {/* Rango in alto a sinistra */}
      <div
        aria-hidden="true"
        style={{
          alignSelf: 'flex-start',
          fontSize: '18px',
          fontWeight: 800,
          lineHeight: 1,
          color: isSelected ? '#66fcf1' : '#ffffff',
          fontFamily: 'monospace, sans-serif',
        }}
      >
        {card.rank}
      </div>

      {/* Simbolo del Seme Spaziale al Centro (🪐, ⭐, ☄️, 🌌) */}
      <div
        aria-hidden="true"
        style={{
          fontSize: '38px',
          lineHeight: 1,
          filter: isSelected ? 'drop-shadow(0 0 8px rgba(102, 252, 241, 0.6))' : 'none',
          transition: 'filter 0.15s ease',
        }}
      >
        {SUIT_SYMBOLS[card.suit]}
      </div>

      {/* Valore in fiches in basso a destra */}
      <div
        aria-hidden="true"
        style={{
          alignSelf: 'flex-end',
          fontSize: '12px',
          fontWeight: 700,
          color: '#c5c6c7',
        }}
      >
        +{card.value}
      </div>
    </div>
  );
};
