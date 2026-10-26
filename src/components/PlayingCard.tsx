// src/components/PlayingCard.tsx
import React from 'react';
import { Card, RANK_NAMES, SUIT_SYMBOLS, Suit } from '../game/logic';

interface PlayingCardProps {
  card: Card;
  isSelected: boolean;
  tabIndex: number;
  onSelect: (card: Card) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  cardRef?: (node: HTMLDivElement | null) => void;
}

// Colori distinti ad alto contrasto per i semi (WCAG AAA su sfondo bianco)
export const SUIT_COLORS: Record<Suit, { main: string; lightBg: string; border: string }> = {
  Pianeti: {
    main: '#b45309', // Ambra/Bronzo scuro
    lightBg: '#fef3c7',
    border: '#d97706',
  },
  Stelle: {
    main: '#be123c', // Rosso Rubino classico da poker
    lightBg: '#ffe4e6',
    border: '#e11d48',
  },
  Comete: {
    main: '#0369a1', // Blu/Zaffiro profondo
    lightBg: '#e0f2fe',
    border: '#0284c7',
  },
  Galassie: {
    main: '#6b21a8', // Viola/Indaco reale
    lightBg: '#f3e8ff',
    border: '#9333ea',
  },
};

// Generatore di pips centrali per le carte numerate (simula la disposizione reale delle carte da poker)
const renderCardCenter = (card: Card, color: string, symbol: string) => {
  const rank = card.rank;

  // 1. Asso
  if (rank === 'A') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '38px', lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
          {symbol}
        </span>
        <span style={{ fontSize: '11px', fontWeight: 800, color, letterSpacing: '1px', marginTop: '4px' }}>
          ASSO
        </span>
      </div>
    );
  }

  // 2. Figure Reali (J, Q, K)
  if (rank === 'K') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.03)',
        borderRadius: '8px',
        padding: '6px 8px',
        border: `1px solid ${color}33`,
      }}>
        <span style={{ fontSize: '28px', lineHeight: 1 }}>👑</span>
        <span style={{ fontSize: '12px', fontWeight: 900, color, marginTop: '2px' }}>RE</span>
        <span style={{ fontSize: '16px', lineHeight: 1 }}>{symbol}</span>
      </div>
    );
  }

  if (rank === 'Q') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.03)',
        borderRadius: '8px',
        padding: '6px 8px',
        border: `1px solid ${color}33`,
      }}>
        <span style={{ fontSize: '26px', lineHeight: 1 }}>👸</span>
        <span style={{ fontSize: '12px', fontWeight: 900, color, marginTop: '2px' }}>REGINA</span>
        <span style={{ fontSize: '16px', lineHeight: 1 }}>{symbol}</span>
      </div>
    );
  }

  if (rank === 'J') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.03)',
        borderRadius: '8px',
        padding: '6px 8px',
        border: `1px solid ${color}33`,
      }}>
        <span style={{ fontSize: '26px', lineHeight: 1 }}>⚔️</span>
        <span style={{ fontSize: '12px', fontWeight: 900, color, marginTop: '2px' }}>FANTE</span>
        <span style={{ fontSize: '16px', lineHeight: 1 }}>{symbol}</span>
      </div>
    );
  }

  // 3. Carte numerate (2-10): visualizzazione a pips tipica del poker
  const count = parseInt(rank, 10);
  if (count <= 3) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} style={{ fontSize: '16px', lineHeight: 1 }}>
            {symbol}
          </span>
        ))}
      </div>
    );
  }

  if (count <= 6) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', alignItems: 'center' }}>
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} style={{ fontSize: '15px', lineHeight: 1, textAlign: 'center' }}>
            {symbol}
          </span>
        ))}
      </div>
    );
  }

  // 7, 8, 9, 10
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2px 6px',
      alignItems: 'center',
      justifyItems: 'center',
      maxWidth: '46px',
    }}>
      {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
        <span key={i} style={{ fontSize: '13px', lineHeight: 1 }}>
          {symbol}
        </span>
      ))}
    </div>
  );
};

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

  const theme = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];

  return (
    <div
      ref={cardRef}
      role="option"
      aria-selected={isSelected}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      onClick={() => onSelect(card)}
      className={`poker-card ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'relative',
        width: '92px',
        height: '138px',
        minWidth: '44px',
        minHeight: '44px',
        margin: '6px',
        backgroundColor: '#ffffff', // Fondo bianco classico delle carte da gioco
        borderRadius: '10px',
        boxShadow: isSelected
          ? '0 14px 28px rgba(0, 0, 0, 0.4), 0 0 15px rgba(102, 252, 241, 0.7)'
          : '0 4px 10px rgba(0, 0, 0, 0.35)',
        border: isSelected ? '3px solid #66fcf1' : '1px solid #cbd5e1',
        transform: isSelected ? 'translateY(-18px) scale(1.03)' : 'translateY(0) scale(1)',
        transition: 'transform 0.15s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.15s ease, border-color 0.15s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '6px',
        userSelect: 'none',
        overflow: 'hidden',
        color: theme.main,
      }}
    >
      {/* Texture interna delicata stile carta telata */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          borderRadius: '9px',
          border: `1px solid ${isSelected ? '#66fcf1' : 'rgba(0, 0, 0, 0.08)'}`,
        }}
      />

      {/* Indice Angolare in alto a sinistra (Valore + Seme) */}
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          alignSelf: 'flex-start',
          lineHeight: 1,
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 900, fontFamily: 'monospace, sans-serif' }}>
          {card.rank}
        </span>
        <span style={{ fontSize: '13px', marginTop: '1px' }}>
          {symbol}
        </span>
      </div>

      {/* Zona Centrale della Carta: Pips o Figura Reale */}
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        {renderCardCenter(card, theme.main, symbol)}
      </div>

      {/* Indice Angolare in basso a destra (Capovolto a 180° come nelle vere carte da poker) */}
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          alignSelf: 'flex-end',
          lineHeight: 1,
          transform: 'rotate(180deg)',
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 900, fontFamily: 'monospace, sans-serif' }}>
          {card.rank}
        </span>
        <span style={{ fontSize: '13px', marginTop: '1px' }}>
          {symbol}
        </span>
      </div>

      {/* Badge con fiches della carta (in basso al centro, sobrio) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          fontWeight: 700,
          color: '#64748b',
          backgroundColor: '#f1f5f9',
          padding: '1px 5px',
          borderRadius: '4px',
        }}
      >
        +{card.value}
      </div>
    </div>
  );
};
