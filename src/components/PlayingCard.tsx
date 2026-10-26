// src/components/PlayingCard.tsx
import React from 'react';
import { Card, RANK_NAMES, Suit } from '../game/logic';

interface PlayingCardProps {
  card: Card;
  isSelected: boolean;
  tabIndex: number;
  onSelect: (card: Card) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  cardRef?: (node: HTMLDivElement | null) => void;
}

// Colori standard del poker (Cuori/Quadri = Rosso, Picche/Fiori = Nero)
export const SUIT_COLORS: Record<Suit, string> = {
  Cuori: '#d00000',
  Quadri: '#d00000',
  Picche: '#1a1a1a',
  Fiori: '#1a1a1a',
};

export const SUIT_GLYPHS: Record<Suit, string> = {
  Cuori: '♥',
  Quadri: '♦',
  Picche: '♠',
  Fiori: '♣',
};

// =========================================================================
// ILLUSTRAZIONI SVG VETTORIALI PER LE FIGURE REALI (J, Q, K) - BIFRONTI
// =========================================================================

// Singola metà del Re (King) con corona d'oro, barba, ermellino e veste regale
const KingHalf = ({ isRed }: { isRed: boolean }) => {
  const primaryColor = isRed ? '#d00000' : '#1a1a1a';
  const secondaryColor = isRed ? '#1d3557' : '#d00000';

  return (
    <g>
      {/* Sfondo / Mantello */}
      <path d="M 15 50 L 15 28 Q 15 16 32 16 L 68 16 Q 85 16 85 28 L 85 50 Z" fill={secondaryColor} />
      {/* Collo in pelliccia / ermellino */}
      <path d="M 28 26 Q 50 36 72 26 L 68 34 Q 50 42 32 34 Z" fill="#ffffff" stroke="#111" strokeWidth="0.8" />
      {/* Volto del Re */}
      <path d="M 36 14 Q 50 14 64 14 Q 64 28 50 32 Q 36 28 36 14 Z" fill="#ffe5d9" stroke="#111" strokeWidth="0.8" />
      {/* Barba e baffi */}
      <path d="M 40 22 Q 50 26 60 22 Q 50 32 40 22 Z" fill="#f8f9fa" stroke="#111" strokeWidth="0.8" />
      <path d="M 43 20 Q 50 23 57 20" stroke="#111" strokeWidth="1" fill="none" />
      {/* Occhi e naso */}
      <circle cx="45" cy="18" r="1.2" fill="#111" />
      <circle cx="55" cy="18" r="1.2" fill="#111" />
      <path d="M 50 17 L 50 21" stroke="#111" strokeWidth="0.8" fill="none" />
      {/* Capelli biondi/reali */}
      <path d="M 32 14 Q 34 25 38 25 L 36 14 Z" fill="#e9c46a" stroke="#111" strokeWidth="0.6" />
      <path d="M 68 14 Q 66 25 62 25 L 64 14 Z" fill="#e9c46a" stroke="#111" strokeWidth="0.6" />
      {/* Corona maestosa del Re */}
      <path d="M 33 14 L 35 6 L 43 11 L 50 4 L 57 11 L 65 6 L 67 14 Z" fill="#e9c46a" stroke="#111" strokeWidth="1" />
      {/* Gioielli sulla corona */}
      <circle cx="50" cy="5" r="1.5" fill={primaryColor} />
      <circle cx="35" cy="7" r="1.2" fill="#2a9d8f" />
      <circle cx="65" cy="7" r="1.2" fill="#2a9d8f" />
      {/* Dettagli della tunica regale */}
      <rect x="35" y="36" width="30" height="14" fill={primaryColor} stroke="#111" strokeWidth="0.8" />
      <line x1="50" y1="36" x2="50" y2="50" stroke="#e9c46a" strokeWidth="2" />
      {/* Spada/Scettro tenuto in mano */}
      <line x1="20" y1="18" x2="20" y2="50" stroke="#e9c46a" strokeWidth="2.5" />
      <circle cx="20" cy="16" r="2.5" fill="#e9c46a" stroke="#111" strokeWidth="0.8" />
    </g>
  );
};

// Singola metà della Regina (Queen) con corona raffinata, scollatura e fiori
const QueenHalf = ({ isRed }: { isRed: boolean }) => {
  const primaryColor = isRed ? '#d00000' : '#1a1a1a';
  const secondaryColor = isRed ? '#1d3557' : '#d00000';

  return (
    <g>
      {/* Mantello e spalle */}
      <path d="M 16 50 L 16 30 Q 22 18 36 17 L 64 17 Q 78 18 84 30 L 84 50 Z" fill={secondaryColor} />
      {/* Velo / Capelli dorati fluenti */}
      <path d="M 28 16 Q 22 35 28 45 L 34 45 Q 30 25 34 16 Z" fill="#e9c46a" stroke="#111" strokeWidth="0.6" />
      <path d="M 72 16 Q 78 35 72 45 L 66 45 Q 70 25 66 16 Z" fill="#e9c46a" stroke="#111" strokeWidth="0.6" />
      {/* Volto della Regina */}
      <path d="M 38 14 Q 50 14 62 14 Q 62 27 50 30 Q 38 27 38 14 Z" fill="#ffe5d9" stroke="#111" strokeWidth="0.8" />
      {/* Occhi e labbra */}
      <circle cx="45" cy="18" r="1.2" fill="#111" />
      <circle cx="55" cy="18" r="1.2" fill="#111" />
      <path d="M 50 18 L 50 21" stroke="#111" strokeWidth="0.8" fill="none" />
      <path d="M 46 24 Q 50 26 54 24" stroke="#d00000" strokeWidth="1.2" fill="none" />
      {/* Corona reale elegante */}
      <path d="M 37 14 L 40 7 L 46 11 L 50 5 L 54 11 L 60 7 L 63 14 Z" fill="#e9c46a" stroke="#111" strokeWidth="1" />
      <circle cx="50" cy="6" r="1.4" fill={primaryColor} />
      <circle cx="40" cy="8" r="1" fill="#ffffff" />
      <circle cx="60" cy="8" r="1" fill="#ffffff" />
      {/* Collana regale */}
      <path d="M 40 29 Q 50 35 60 29" stroke="#e9c46a" strokeWidth="1.5" fill="none" />
      {/* Fiore / Scettro tenuto in mano */}
      <circle cx="76" cy="30" r="4" fill="#ffffff" stroke={primaryColor} strokeWidth="1.2" />
      <circle cx="76" cy="30" r="1.5" fill="#e9c46a" />
      <line x1="76" y1="34" x2="76" y2="50" stroke="#2a9d8f" strokeWidth="1.5" />
    </g>
  );
};

// Singola metà del Fante (Jack) con cappello rinascimentale piumato, alabarda e corazza
const JackHalf = ({ isRed }: { isRed: boolean }) => {
  const primaryColor = isRed ? '#d00000' : '#1a1a1a';
  const secondaryColor = isRed ? '#1d3557' : '#d00000';

  return (
    <g>
      {/* Spalle e uniforme */}
      <path d="M 16 50 L 16 32 Q 24 20 38 18 L 62 18 Q 76 20 84 32 L 84 50 Z" fill={secondaryColor} />
      {/* Volto giovane del Fante */}
      <path d="M 38 15 Q 50 15 62 15 Q 62 28 50 31 Q 38 28 38 15 Z" fill="#ffe5d9" stroke="#111" strokeWidth="0.8" />
      {/* Capelli biondo/castano corti */}
      <path d="M 34 16 Q 32 26 38 27 L 38 16 Z" fill="#bc6c25" stroke="#111" strokeWidth="0.6" />
      <path d="M 66 16 Q 68 26 62 27 L 62 16 Z" fill="#bc6c25" stroke="#111" strokeWidth="0.6" />
      {/* Occhi e naso deciso */}
      <circle cx="45" cy="18" r="1.2" fill="#111" />
      <circle cx="55" cy="18" r="1.2" fill="#111" />
      <path d="M 50 17 L 51 21" stroke="#111" strokeWidth="0.8" fill="none" />
      <path d="M 46 24 L 54 24" stroke="#111" strokeWidth="1" fill="none" />
      {/* Berretto rinascimentale da fante con piuma */}
      <path d="M 33 15 Q 50 8 67 15 L 65 11 Q 50 5 35 11 Z" fill={primaryColor} stroke="#111" strokeWidth="1" />
      {/* Piuma elegante sul cappello */}
      <path d="M 62 11 Q 78 2 76 16" stroke="#ffffff" strokeWidth="2" fill="none" />
      {/* Alabarda / Asta tenuta dal soldato */}
      <line x1="22" y1="8" x2="22" y2="50" stroke="#7f8c8d" strokeWidth="2.5" />
      <path d="M 16 10 L 22 2 L 28 10 Z" fill="#bdc3c7" stroke="#111" strokeWidth="0.8" />
      {/* Dettagli corazza */}
      <circle cx="50" cy="38" r="3" fill="#e9c46a" stroke="#111" strokeWidth="0.8" />
    </g>
  );
};

// Componente Figura Completa Bifronte (Reversibile a 180° come nelle carte reali)
const CourtCardIllustration = ({ rank, suit }: { rank: 'J' | 'Q' | 'K'; suit: Suit }) => {
  const isRed = suit === 'Cuori' || suit === 'Quadri';

  const HalfComponent = rank === 'K' ? KingHalf : rank === 'Q' ? QueenHalf : JackHalf;

  return (
    <svg
      viewBox="0 0 100 100"
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
      preserveAspectRatio="none"
    >
      {/* Bordo rettangolare decorativo interno della figura */}
      <rect
        x="6"
        y="4"
        width="88"
        height="92"
        fill="#fdfbf7"
        stroke="#111111"
        strokeWidth="1.2"
      />
      <rect
        x="9"
        y="7"
        width="82"
        height="86"
        fill="none"
        stroke="#e9c46a"
        strokeWidth="0.8"
      />

      {/* Linea mediana di divisione geometrica bifronte */}
      <line x1="8" y1="50" x2="92" y2="50" stroke="#111111" strokeWidth="1" />

      {/* Metà Superiore */}
      <g clipPath="url(#topHalfClip)">
        <HalfComponent isRed={isRed} />
      </g>

      {/* Metà Inferiore Capovolta (180°) */}
      <g transform="rotate(180 50 50)">
        <HalfComponent isRed={isRed} />
      </g>

      {/* Clip path per garantire separazione pulita sulla linea di mezzo */}
      <defs>
        <clipPath id="topHalfClip">
          <rect x="0" y="0" width="100" height="50" />
        </clipPath>
      </defs>
    </svg>
  );
};

// =========================================================================
// LAYOUT AUTENTICO DEI PIPS DEL POKER PER LE CARTE NUMERATE (2-10) E L'ASSO
// =========================================================================
const renderPokerPips = (rank: string, glyph: string, color: string) => {
  // Asso: Grande simbolo centrale monumentale da poker
  if (rank === 'A') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <span
          style={{
            fontSize: '48px',
            lineHeight: 1,
            color,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
          }}
        >
          {glyph}
        </span>
      </div>
    );
  }

  // Griglia proporzionata per carte da 2 a 10 (simula la matrice a 3 colonne delle carte Bicycle)
  const num = parseInt(rank, 10);

  // Mappatura delle coordinate dei pips per ciascun numero (3 colonne: Sinistra, Centro, Destra)
  const pipCoordinates: Record<number, { col: number; row: number; inverted?: boolean }[]> = {
    2: [
      { col: 1, row: 0 },
      { col: 1, row: 4, inverted: true },
    ],
    3: [
      { col: 1, row: 0 },
      { col: 1, row: 2 },
      { col: 1, row: 4, inverted: true },
    ],
    4: [
      { col: 0, row: 0 },
      { col: 2, row: 0 },
      { col: 0, row: 4, inverted: true },
      { col: 2, row: 4, inverted: true },
    ],
    5: [
      { col: 0, row: 0 },
      { col: 2, row: 0 },
      { col: 1, row: 2 },
      { col: 0, row: 4, inverted: true },
      { col: 2, row: 4, inverted: true },
    ],
    6: [
      { col: 0, row: 0 },
      { col: 2, row: 0 },
      { col: 0, row: 2 },
      { col: 2, row: 2 },
      { col: 0, row: 4, inverted: true },
      { col: 2, row: 4, inverted: true },
    ],
    7: [
      { col: 0, row: 0 },
      { col: 2, row: 0 },
      { col: 1, row: 1 },
      { col: 0, row: 2 },
      { col: 2, row: 2 },
      { col: 0, row: 4, inverted: true },
      { col: 2, row: 4, inverted: true },
    ],
    8: [
      { col: 0, row: 0 },
      { col: 2, row: 0 },
      { col: 1, row: 1 },
      { col: 0, row: 2 },
      { col: 2, row: 2 },
      { col: 1, row: 3, inverted: true },
      { col: 0, row: 4, inverted: true },
      { col: 2, row: 4, inverted: true },
    ],
    9: [
      { col: 0, row: 0 },
      { col: 2, row: 0 },
      { col: 0, row: 1 },
      { col: 2, row: 1 },
      { col: 1, row: 2 },
      { col: 0, row: 3, inverted: true },
      { col: 2, row: 3, inverted: true },
      { col: 0, row: 4, inverted: true },
      { col: 2, row: 4, inverted: true },
    ],
    10: [
      { col: 0, row: 0 },
      { col: 2, row: 0 },
      { col: 1, row: 0.8 },
      { col: 0, row: 1.5 },
      { col: 2, row: 1.5 },
      { col: 0, row: 3, inverted: true },
      { col: 2, row: 3, inverted: true },
      { col: 1, row: 3.5, inverted: true },
      { col: 0, row: 4.5, inverted: true },
      { col: 2, row: 4.5, inverted: true },
    ],
  };

  const pips = pipCoordinates[num] || [];

  return (
    <div
      style={{
        position: 'relative',
        width: '52px',
        height: '84px',
        margin: '0 auto',
      }}
    >
      {pips.map((p, i) => {
        // Posizionamento percentuale calcolato
        const left = p.col === 0 ? '6%' : p.col === 1 ? '50%' : '94%';
        const top = `${(p.row / 4.2) * 82 + 8}%`;

        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left,
              top,
              transform: `translate(-50%, -50%) ${p.inverted ? 'rotate(180deg)' : ''}`,
              fontSize: num >= 7 ? '13px' : '15px',
              lineHeight: 1,
              color,
              userSelect: 'none',
            }}
          >
            {glyph}
          </span>
        );
      })}
    </div>
  );
};

// =========================================================================
// COMPONENTE PRINCIPALE CARTA DA POKER
// =========================================================================
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

  const color = SUIT_COLORS[card.suit];
  const glyph = SUIT_GLYPHS[card.suit];
  const isCourt = ['J', 'Q', 'K'].includes(card.rank);

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
        width: '98px',
        height: '144px',
        minWidth: '44px',
        minHeight: '44px',
        margin: '6px',
        backgroundColor: '#ffffff', // Fondo bianco immacolato
        borderRadius: '8px', // Angoli dolcemente arrotondati classici da poker
        border: isSelected ? '3px solid #00f2fe' : '1px solid #c9d1d9',
        boxShadow: isSelected
          ? '0 16px 32px rgba(0, 0, 0, 0.45), 0 0 16px rgba(0, 242, 254, 0.8)'
          : '0 3px 8px rgba(0, 0, 0, 0.25)',
        transform: isSelected ? 'translateY(-16px)' : 'translateY(0)',
        transition: 'transform 0.15s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.15s ease, border-color 0.15s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '5px',
        userSelect: 'none',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* INDICE IN ALTO A SINISTRA (Rango sopra, Seme sotto) */}
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          alignSelf: 'flex-start',
          lineHeight: 1,
          color,
          width: '18px',
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontSize: card.rank === '10' ? '15px' : '17px',
            fontWeight: 800,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
            letterSpacing: '-0.5px',
          }}
        >
          {card.rank}
        </span>
        <span
          style={{
            fontSize: '14px',
            marginTop: '1px',
            lineHeight: 1,
          }}
        >
          {glyph}
        </span>
      </div>

      {/* PARTE CENTRALE: FIGURE REALI BIFRONTI (J, Q, K) O PIPS (A, 2-10) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: isCourt ? '10px' : '12px',
          left: isCourt ? '18px' : '12px',
          right: isCourt ? '18px' : '12px',
          bottom: isCourt ? '10px' : '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        {isCourt ? (
          <CourtCardIllustration rank={card.rank as 'J' | 'Q' | 'K'} suit={card.suit} />
        ) : (
          renderPokerPips(card.rank, glyph, color)
        )}
      </div>

      {/* INDICE IN BASSO A DESTRA (Capovolto a 180° come nelle carte autentiche) */}
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          alignSelf: 'flex-end',
          lineHeight: 1,
          color,
          width: '18px',
          transform: 'rotate(180deg)',
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontSize: card.rank === '10' ? '15px' : '17px',
            fontWeight: 800,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
            letterSpacing: '-0.5px',
          }}
        >
          {card.rank}
        </span>
        <span
          style={{
            fontSize: '14px',
            marginTop: '1px',
            lineHeight: 1,
          }}
        >
          {glyph}
        </span>
      </div>
    </div>
  );
};
