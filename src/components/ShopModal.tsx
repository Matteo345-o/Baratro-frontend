// src/components/ShopModal.tsx
import React from 'react';
import { Joker } from '../game/logic';

interface ShopModalProps {
  money: number;
  equippedJokers: Joker[];
  availableJokers: Joker[];
  onBuyJoker: (joker: Joker) => void;
  onSellJoker: (jokerId: string) => void;
  onStartNextRound: () => void;
  nextRoundNumber: number;
  nextRoundTarget: number;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  money,
  equippedJokers,
  availableJokers,
  onBuyJoker,
  onSellJoker,
  onStartNextRound,
  nextRoundNumber,
  nextRoundTarget,
}) => {
  return (
    <section
      role="region"
      aria-label="Negozio Spaziale tra i round"
      style={{
        background: '#161b22',
        border: '2px solid #66fcf1',
        borderRadius: '14px',
        padding: '20px',
        margin: '16px 0',
        color: '#ffffff',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header del Negozio */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid #30363d',
          paddingBottom: '14px',
          marginBottom: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '22px', color: '#66fcf1', margin: 0 }}>
            🛒 Negozio Spaziale (Inter-Round)
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#8b949e' }}>
            Spendi i crediti guadagnati per potenziare le tue mani nel prossimo round.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div
            style={{
              background: '#0d1117',
              border: '1px solid #e3b341',
              padding: '8px 16px',
              borderRadius: '8px',
              color: '#f0883e',
              fontWeight: 800,
              fontSize: '18px',
            }}
          >
            💰 Saldo: ${money}
          </div>

          <div
            style={{
              background: '#0d1117',
              border: '1px solid #58a6ff',
              padding: '8px 16px',
              borderRadius: '8px',
              color: '#58a6ff',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            Jolly Equipaggiati: {equippedJokers.length} / 5
          </div>
        </div>
      </div>

      {/* Jolly Disponibili all'Acquisto */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', color: '#e6edf3', marginBottom: '12px' }}>
          Carte Jolly in Vendita
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '12px',
          }}
        >
          {availableJokers.map((joker) => {
            const isOwned = equippedJokers.some((j) => j.id === joker.id);
            const canAfford = money >= joker.cost;
            const slotsFull = equippedJokers.length >= 5;

            return (
              <div
                key={joker.id}
                style={{
                  background: '#0d1117',
                  border: isOwned ? '1px solid #30363d' : '1px solid #45a29e',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: isOwned ? 0.6 : 1,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '24px' }}>{joker.icon}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor:
                          joker.rarity === 'Leggendario'
                            ? '#a371f733'
                            : joker.rarity === 'Raro'
                            ? '#58a6ff33'
                            : '#3fb95033',
                        color:
                          joker.rarity === 'Leggendario'
                            ? '#d2a8ff'
                            : joker.rarity === 'Raro'
                            ? '#79c0ff'
                            : '#7ee787',
                        fontWeight: 700,
                      }}
                    >
                      {joker.rarity}
                    </span>
                  </div>

                  <strong style={{ fontSize: '16px', color: '#ffffff', display: 'block', marginBottom: '4px' }}>
                    {joker.name}
                  </strong>
                  <p style={{ fontSize: '13px', color: '#8b949e', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                    {joker.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#f0883e' }}>
                    ${joker.cost}
                  </span>
                  <button
                    className="btn btn-primary"
                    onClick={() => onBuyJoker(joker)}
                    disabled={isOwned || !canAfford || slotsFull}
                    aria-label={`Compra ${joker.name} per ${joker.cost} dollari`}
                    style={{ minHeight: '44px', padding: '6px 14px' }}
                  >
                    {isOwned ? 'Posseduto' : !canAfford ? 'Fondi Insuff.' : slotsFull ? 'Slot Pieni' : 'Acquista'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Jolly Attualmente Equipaggiati (con opzione Vendi) */}
      {equippedJokers.length > 0 && (
        <div style={{ marginBottom: '24px', borderTop: '1px solid #30363d', paddingTop: '16px' }}>
          <h3 style={{ fontSize: '15px', color: '#e6edf3', marginBottom: '10px' }}>
            I Tuoi Jolly Attivi
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {equippedJokers.map((joker) => {
              const sellPrice = Math.max(1, Math.floor(joker.cost / 2));
              return (
                <div
                  key={joker.id}
                  style={{
                    background: '#21262d',
                    border: '1px solid #66fcf1',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{joker.icon}</span>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 700, display: 'block' }}>{joker.name}</span>
                    <span style={{ fontSize: '11px', color: '#8b949e' }}>{joker.description}</span>
                  </div>
                  <button
                    onClick={() => onSellJoker(joker.id)}
                    aria-label={`Vendi ${joker.name} per ${sellPrice} dollari`}
                    style={{
                      background: '#3d1419',
                      color: '#ff7b72',
                      border: '1px solid #ff7b72',
                      padding: '4px 8px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      minHeight: '36px',
                    }}
                  >
                    Vendi (+${sellPrice})
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pulsante per proseguire al prossimo round */}
      <div
        style={{
          borderTop: '1px solid #30363d',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <span style={{ color: '#8b949e', fontSize: '14px' }}>
          Prossimo traguardo: <strong>Round {nextRoundNumber} di 3</strong> (Obiettivo: <strong>{nextRoundTarget} punti</strong>)
        </span>
        <button
          className="btn btn-primary"
          onClick={onStartNextRound}
          autoFocus
          style={{ fontSize: '16px', padding: '12px 24px', fontWeight: 800 }}
        >
          🚀 Inizia Round {nextRoundNumber} ➔
        </button>
      </div>
    </section>
  );
};
