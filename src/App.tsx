// src/App.tsx
import { useState, useEffect } from 'react';
import { useGame } from './game/useGame';
import { Hand } from './components/Hand';
import { HelpModal } from './components/HelpModal';
import { evaluateHand, calculateScore } from './game/logic';

export const App = () => {
  const {
    hand,
    selectedCards,
    score,
    targetScore,
    currentRound,
    handsLeft,
    discardsLeft,
    status,
    announcement,
    toggleCardSelection,
    playHand,
    discardCards,
    sortHand,
    nextRound,
    resetGame,
  } = useGame();

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Calcolo in tempo reale della combinazione per le carte selezionate
  const currentEvaluation =
    selectedCards.length > 0 ? evaluateHand(selectedCards) : null;
  const potentialPoints =
    currentEvaluation && currentEvaluation.validCards.length > 0
      ? calculateScore(currentEvaluation.combo, currentEvaluation.validCards)
      : 0;

  // Scorciatoie globali da tastiera (?, v, c, j, s)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignora se siamo dentro un input o se la modale è aperta
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'v' && !isHelpOpen) {
        e.preventDefault();
        sortHand('rank');
      } else if (e.key.toLowerCase() === 'c' && !isHelpOpen) {
        e.preventDefault();
        sortHand('suit');
      } else if (e.key.toLowerCase() === 'j' && !isHelpOpen) {
        if (selectedCards.length >= 1 && selectedCards.length <= 5 && handsLeft > 0) {
          e.preventDefault();
          playHand();
        }
      } else if (e.key.toLowerCase() === 's' && !isHelpOpen) {
        if (selectedCards.length >= 1 && selectedCards.length <= 5 && discardsLeft > 0) {
          e.preventDefault();
          discardCards();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isHelpOpen, selectedCards, handsLeft, discardsLeft, playHand, discardCards, sortHand]);

  return (
    <main
      style={{
        maxWidth: '900px',
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
            🪐 AstroBalatro
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#c5c6c7' }}>
            Un Balatro accessibile a tema spaziale
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
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

      {/* Pannello Stato Partita (Punti, Round, Mani, Scarti) */}
      <section
        aria-label="Informazioni della partita in corso"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          margin: '16px 0',
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
          margin: '8px 0',
          fontSize: '15px',
        }}
      >
        📢 {announcement}
      </div>

      {/* Notifiche di Vittoria Round o Fine Partita */}
      {status === 'round_won' && (
        <div style={{ background: '#0d3b2e', border: '2px solid #06d6a0', padding: '16px', borderRadius: '8px', margin: '12px 0', textAlign: 'center' }}>
          <h2 style={{ color: '#06d6a0', marginBottom: '8px' }}>🎉 Obiettivo Round Raggiunto!</h2>
          <p style={{ marginBottom: '12px' }}>Hai superato l'obiettivo di {targetScore} punti.</p>
          <button className="btn btn-primary" onClick={nextRound} autoFocus>
            Passa al Prossimo Round ➔
          </button>
        </div>
      )}

      {status === 'game_won' && (
        <div style={{ background: '#0d3b2e', border: '2px solid #ffd166', padding: '20px', borderRadius: '8px', margin: '12px 0', textAlign: 'center' }}>
          <h2 style={{ color: '#ffd166', marginBottom: '8px' }}>🏆 VITTORIA FINALE!</h2>
          <p style={{ marginBottom: '16px' }}>Congratulazioni, hai completato con successo tutti e 3 i round!</p>
          <button className="btn btn-primary" onClick={resetGame} autoFocus>
            Gioca un'altra partita
          </button>
        </div>
      )}

      {status === 'game_over' && (
        <div style={{ background: '#3d1419', border: '2px solid #ef476f', padding: '20px', borderRadius: '8px', margin: '12px 0', textAlign: 'center' }}>
          <h2 style={{ color: '#ef476f', marginBottom: '8px' }}>💀 Partita Persa!</h2>
          <p style={{ marginBottom: '16px' }}>Hai esaurito le mani prima di raggiungere {targetScore} punti.</p>
          <button className="btn btn-danger" onClick={resetGame} autoFocus>
            Riprova (Nuova Partita)
          </button>
        </div>
      )}

      {/* Anteprima combinazione corrente */}
      <div
        style={{
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          margin: '8px 0',
          padding: '8px',
          background: selectedCards.length > 0 ? '#1f2833' : 'transparent',
          borderRadius: '8px',
          border: selectedCards.length > 0 ? '1px dashed #66fcf1' : 'none',
        }}
      >
        {currentEvaluation ? (
          <span style={{ fontSize: '16px' }}>
            Combinazione:{' '}
            <strong style={{ color: '#66fcf1' }}>{currentEvaluation.combo}</strong>{' '}
            (Punti stimati:{' '}
            <strong style={{ color: '#06d6a0' }}>+{potentialPoints}</strong>)
          </span>
        ) : (
          <span style={{ color: '#888', fontSize: '14px' }}>
            Usa le frecce e lo Spazio per selezionare da 1 a 5 carte
          </span>
        )}
      </div>

      {/* Area Carte in mano */}
      <section aria-label="Mano di carte del giocatore">
        <Hand
          hand={hand}
          selectedCards={selectedCards}
          onToggleCard={toggleCardSelection}
          onPlay={playHand}
          onDiscard={discardCards}
        />
      </section>

      {/* Pulsanti Azioni e Ordinamento (Requisito slide 6 & 10: bottoni con min 44x44px) */}
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
            handsLeft <= 0 ||
            status !== 'playing'
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
            discardsLeft <= 0 ||
            status !== 'playing'
          }
          aria-label="Scarta le carte selezionate (scorciatoia: tasto S)"
        >
          🗑️ Scarta (S) {selectedCards.length > 0 && `(${selectedCards.length})`}
        </button>

        <button
          onClick={() => sortHand('rank')}
          disabled={status !== 'playing'}
          aria-label="Ordina le carte per valore decrescente (scorciatoia: tasto V)"
        >
          🔢 Ordina Valore (V)
        </button>

        <button
          onClick={() => sortHand('suit')}
          disabled={status !== 'playing'}
          aria-label="Ordina le carte per seme (scorciatoia: tasto C)"
        >
          🪐 Ordina Seme (C)
        </button>
      </footer>

      {/* Modale Aiuto con scorciatoie tastiera (WAI-ARIA Dialog) */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </main>
  );
};
