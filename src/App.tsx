// src/App.tsx
import { useState, useEffect } from 'react';
import { useGame } from './game/useGame';
import { Hand } from './components/Hand';
import { HelpModal } from './components/HelpModal';
import { ShopModal } from './components/ShopModal';
import { evaluateHand, calculateScoreWithJokers } from './game/logic';

export const App = () => {
  const {
    hand,
    selectedCards,
    score,
    targetScore,
    currentRound,
    handsLeft,
    discardsLeft,
    money,
    jokers,
    allShopJokers,
    status,
    announcement,
    toggleCardSelection,
    playHand,
    discardCards,
    sortHand,
    openShop,
    buyJoker,
    sellJoker,
    startNextRound,
    resetGame,
  } = useGame();

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Calcolo in tempo reale della combinazione e potenziale punteggio con i Jolly attivi
  const currentEvaluation =
    selectedCards.length > 0 ? evaluateHand(selectedCards) : null;
  const potentialBreakdown =
    currentEvaluation && currentEvaluation.validCards.length > 0
      ? calculateScoreWithJokers(currentEvaluation.combo, currentEvaluation.validCards, jokers)
      : null;

  // Scorciatoie globali da tastiera (?, v, c, j, s)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'v' && !isHelpOpen && status === 'playing') {
        e.preventDefault();
        sortHand('rank');
      } else if (e.key.toLowerCase() === 'c' && !isHelpOpen && status === 'playing') {
        e.preventDefault();
        sortHand('suit');
      } else if (e.key.toLowerCase() === 'j' && !isHelpOpen && status === 'playing') {
        if (selectedCards.length >= 1 && selectedCards.length <= 5 && handsLeft > 0) {
          e.preventDefault();
          playHand();
        }
      } else if (e.key.toLowerCase() === 's' && !isHelpOpen && status === 'playing') {
        if (selectedCards.length >= 1 && selectedCards.length <= 5 && discardsLeft > 0) {
          e.preventDefault();
          discardCards();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isHelpOpen, status, selectedCards, handsLeft, discardsLeft, playHand, discardCards, sortHand]);

  return (
    <main
      style={{
        maxWidth: '920px',
        margin: '0 auto',
        padding: '16px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Annuncio Screen Reader (aria-live polite) obbligatorio per WAI-ARIA */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Header del gioco */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '2px solid #1f2833',
          paddingBottom: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', color: '#66fcf1', margin: 0 }}>
            🪐 Stellaris
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#c5c6c7' }}>
            Un Balatro accessibile a tema spaziale con carte da poker e Jolly
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div
            style={{
              background: '#161b22',
              border: '1px solid #ffd166',
              padding: '6px 12px',
              borderRadius: '8px',
              color: '#ffd166',
              fontWeight: 800,
              fontSize: '15px',
            }}
          >
            💰 ${money}
          </div>

          <button
            onClick={() => setIsHelpOpen(true)}
            aria-label="Apri guida scorciatoie tastiera"
            title="Premi ? sulla tastiera"
          >
            ❓ Aiuto (?)
          </button>
          <button
            onClick={resetGame}
            aria-label="Ricomincia nuova partita"
          >
            🔄 Nuova Partita
          </button>
        </div>
      </header>

      {/* Sezione Jolly Attivi del Giocatore */}
      <section
        aria-label="Jolly attualmente equipaggiati"
        style={{
          margin: '12px 0 4px',
          padding: '8px 12px',
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ fontSize: '13px', color: '#66fcf1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Jolly Attivi ({jokers.length}/5):
          </strong>
          {jokers.length === 0 ? (
            <span style={{ fontSize: '13px', color: '#8b949e' }}>
              Nessun Jolly equipaggiato (comprali nel Negozio tra i round)
            </span>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {jokers.map((j) => (
                <span
                  key={j.id}
                  title={`${j.name}: ${j.description}`}
                  style={{
                    background: '#21262d',
                    border: '1px solid #45a29e',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {j.icon} {j.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pannello Stato Partita (Punti, Round, Mani, Scarti) */}
      <section
        aria-label="Informazioni della partita in corso"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          margin: '12px 0',
        }}
      >
        <div style={{ background: '#1f2833', padding: '12px', borderRadius: '8px', border: '1px solid #45a29e', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: '#c5c6c7', display: 'block' }}>ROUND</span>
          <strong style={{ fontSize: '20px', color: '#66fcf1' }}>{currentRound} / 3</strong>
        </div>

        <div style={{ background: '#1f2833', padding: '12px', borderRadius: '8px', border: '1px solid #45a29e', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: '#c5c6c7', display: 'block' }}>OBIETTIVO</span>
          <strong style={{ fontSize: '20px', color: '#ffd166' }}>{targetScore}</strong>
        </div>

        <div style={{ background: '#1f2833', padding: '12px', borderRadius: '8px', border: '1px solid #45a29e', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: '#c5c6c7', display: 'block' }}>PUNTI ATTUALI</span>
          <strong style={{ fontSize: '20px', color: '#06d6a0' }}>{score}</strong>
        </div>

        <div style={{ background: '#1f2833', padding: '12px', borderRadius: '8px', border: '1px solid #45a29e', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: '#c5c6c7', display: 'block' }}>MANI RIMASTE</span>
          <strong style={{ fontSize: '20px', color: handsLeft > 1 ? '#ffffff' : '#ef476f' }}>
            {handsLeft}
          </strong>
        </div>

        <div style={{ background: '#1f2833', padding: '12px', borderRadius: '8px', border: '1px solid #45a29e', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: '#c5c6c7', display: 'block' }}>SCARTI RIMASTI</span>
          <strong style={{ fontSize: '20px', color: discardsLeft > 0 ? '#ffffff' : '#ef476f' }}>
            {discardsLeft}
          </strong>
        </div>
      </section>

      {/* Banner messaggi visivi per gli utenti */}
      <div
        style={{
          background: '#16222f',
          borderLeft: '4px solid #66fcf1',
          padding: '10px 16px',
          borderRadius: '4px',
          margin: '6px 0 12px',
          fontSize: '15px',
        }}
      >
        📢 {announcement}
      </div>

      {/* SCHERMATA DEL NEGOZIO (ESTENSIONE OBBLIGATORIA SLIDE 6) */}
      {status === 'shop' && (
        <ShopModal
          money={money}
          equippedJokers={jokers}
          availableJokers={allShopJokers}
          onBuyJoker={buyJoker}
          onSellJoker={sellJoker}
          onStartNextRound={startNextRound}
          nextRoundNumber={currentRound + 1}
          nextRoundTarget={currentRound === 1 ? 600 : 1000}
        />
      )}

      {/* Notifiche di Vittoria Round o Fine Partita */}
      {status === 'round_won' && (
        <div style={{ background: '#0d3b2e', border: '2px solid #06d6a0', padding: '18px', borderRadius: '10px', margin: '12px 0', textAlign: 'center' }}>
          <h2 style={{ color: '#06d6a0', marginBottom: '8px' }}>🎉 Obiettivo Round {currentRound} Raggiunto!</h2>
          <p style={{ marginBottom: '14px', fontSize: '15px' }}>
            Hai superato l'obiettivo di {targetScore} punti e guadagnato crediti bonus!
          </p>
          <button className="btn btn-primary" onClick={openShop} autoFocus style={{ fontSize: '16px', padding: '12px 24px' }}>
            🛒 Entra nel Negozio Spaziale ➔
          </button>
        </div>
      )}

      {status === 'game_won' && (
        <div style={{ background: '#0d3b2e', border: '2px solid #ffd166', padding: '24px', borderRadius: '10px', margin: '12px 0', textAlign: 'center' }}>
          <h2 style={{ color: '#ffd166', marginBottom: '8px', fontSize: '26px' }}>🏆 VITTORIA FINALE!</h2>
          <p style={{ marginBottom: '16px', fontSize: '16px' }}>
            Congratulazioni, Comandante! Hai completato con successo tutti e 3 i round di Stellaris!
          </p>
          <button className="btn btn-primary" onClick={resetGame} autoFocus>
            Gioca un'altra partita
          </button>
        </div>
      )}

      {status === 'game_over' && (
        <div style={{ background: '#3d1419', border: '2px solid #ef476f', padding: '24px', borderRadius: '10px', margin: '12px 0', textAlign: 'center' }}>
          <h2 style={{ color: '#ef476f', marginBottom: '8px', fontSize: '24px' }}>💀 Partita Persa!</h2>
          <p style={{ marginBottom: '16px', fontSize: '15px' }}>
            Hai esaurito le 4 mani prima di raggiungere i {targetScore} punti richiesti.
          </p>
          <button className="btn btn-danger" onClick={resetGame} autoFocus>
            Riprova (Nuova Partita)
          </button>
        </div>
      )}

      {/* Anteprima combinazione corrente con calcolo Fiches e Moltiplicatore */}
      {status === 'playing' && (
        <div
          style={{
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            margin: '8px 0',
            padding: '10px 16px',
            background: selectedCards.length > 0 ? '#1f2833' : 'rgba(255,255,255,0.02)',
            borderRadius: '8px',
            border: selectedCards.length > 0 ? '1px dashed #66fcf1' : '1px solid #30363d',
            flexWrap: 'wrap',
          }}
        >
          {potentialBreakdown && currentEvaluation ? (
            <div style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>
                Combinazione: <strong style={{ color: '#66fcf1', fontSize: '17px' }}>{currentEvaluation.combo}</strong>
              </span>
              <span style={{ color: '#8b949e' }}>|</span>
              <span>
                Fiches: <strong style={{ color: '#38bdf8' }}>{potentialBreakdown.totalChips}</strong>
              </span>
              <span style={{ color: '#8b949e' }}>×</span>
              <span>
                Mult: <strong style={{ color: '#f43f5e' }}>{potentialBreakdown.totalMult * potentialBreakdown.xMult}</strong>
              </span>
              <span style={{ color: '#8b949e' }}>=</span>
              <span>
                Punti Stimati: <strong style={{ color: '#06d6a0', fontSize: '18px' }}>+{potentialBreakdown.finalScore}</strong>
              </span>
            </div>
          ) : (
            <span style={{ color: '#8b949e', fontSize: '14px' }}>
              Usa le frecce per muoverti e lo <strong>Spazio</strong> per selezionare da 1 a 5 carte
            </span>
          )}
        </div>
      )}

      {/* Area Carte in mano da Poker (Solo quando in gioco) */}
      {status === 'playing' && (
        <section aria-label="Mano di carte del giocatore">
          <Hand
            hand={hand}
            selectedCards={selectedCards}
            onToggleCard={toggleCardSelection}
            onPlay={playHand}
            onDiscard={discardCards}
          />
        </section>
      )}

      {/* Pulsanti Azioni e Ordinamento (Requisito slide 6 & 10: bottoni con min 44x44px) */}
      {status === 'playing' && (
        <footer
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '2px solid #1f2833',
          }}
        >
          <button
            className="btn btn-primary"
            onClick={playHand}
            disabled={
              selectedCards.length === 0 ||
              selectedCards.length > 5 ||
              handsLeft <= 0
            }
            aria-label="Gioca le carte selezionate (scorciatoia: tasto J)"
          >
            🃏 Gioca Mano (J) {selectedCards.length > 0 && `(${selectedCards.length})`}
          </button>

          <button
            className="btn btn-danger"
            onClick={discardCards}
            disabled={
              selectedCards.length === 0 ||
              selectedCards.length > 5 ||
              discardsLeft <= 0
            }
            aria-label="Scarta le carte selezionate (scorciatoia: tasto S)"
          >
            🗑️ Scarta (S) {selectedCards.length > 0 && `(${selectedCards.length})`}
          </button>

          <button
            onClick={() => sortHand('rank')}
            aria-label="Ordina le carte per valore decrescente (scorciatoia: tasto V)"
          >
            🔢 Ordina Valore (V)
          </button>

          <button
            onClick={() => sortHand('suit')}
            aria-label="Ordina le carte per seme (scorciatoia: tasto C)"
          >
            ♠️ Ordina Seme (C)
          </button>
        </footer>
      )}

      {/* Modale Aiuto con scorciatoie tastiera (WAI-ARIA Dialog) */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </main>
  );
};
