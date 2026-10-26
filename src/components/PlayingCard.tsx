// src/components/PlayingCard.tsx
import { Card, RANK_NAMES, SUIT_SYMBOLS } from '../game/logic';

interface PlayingCardProps {
  card: Card;
  isSelected: boolean;
  tabIndex: number;
  onSelect: (card: Card) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  cardRef?: (node: HTMLDivElement | null) => void;
}

export const PlayingCard = ({
  card,
  isSelected,
  tabIndex,
  onSelect,
  onKeyDown,
  cardRef,
}: PlayingCardProps) => {
  const readableRank = RANK_NAMES[card.rank] || card.rank;
  const ariaLabel = `${readableRank} di ${card.suit}, valore ${card.value}${isSelected ? ', selezionata' : ', non selezionata'}`;

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
        transform: isSelected ? 'translateY(-14px)' : 'none',
        padding: '12px',
        margin: '4px',
        borderRadius: '12px',
        background: isSelected ? '#1f2833' : '#0b0c10',
        color: '#ffffff',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '84px',
        height: '126px',
        minWidth: '44px',
        minHeight: '44px',
        transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
        userSelect: 'none',
        boxShadow: isSelected ? '0 0 12px rgba(102, 252, 241, 0.4)' : '0 2px 5px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ alignSelf: 'flex-start', fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>
        {card.rank}
      </div>
      <div style={{ fontSize: '34px', lineHeight: 1 }} aria-hidden="true">
        {SUIT_SYMBOLS[card.suit]}
      </div>
      <div style={{ alignSelf: 'flex-end', fontSize: '12px', color: '#c5c6c7' }}>
        val: {card.value}
      </div>
    </div>
  );
};
