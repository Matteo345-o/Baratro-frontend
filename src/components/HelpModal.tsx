// src/components/HelpModal.tsx
import { useEffect, useRef } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Gestione tasto Esc e cattura focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Sposta il focus sul bottone di chiusura all'apertura del dialogo
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        aria-describedby="help-modal-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 id="help-modal-title" style={{ color: '#66fcf1', fontSize: '22px' }}>
            Guida ai comandi da tastiera
          </h2>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Chiudi guida scorciatoie"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              color: '#fff',
              cursor: 'pointer',
              minWidth: '44px',
              minHeight: '44px',
            }}
          >
            ✕
          </button>
        </div>

        <p id="help-modal-desc" style={{ marginBottom: '16px', color: '#c5c6c7' }}>
          Questo gioco è completamente accessibile e utilizzabile solo con la tastiera, senza bisogno del mouse.
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #45a29e', textAlign: 'left' }}>
              <th style={{ padding: '8px', color: '#66fcf1' }}>Tasto</th>
              <th style={{ padding: '8px', color: '#66fcf1' }}>Azione</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '8px' }}><kbd style={{ background: '#0b0c10', padding: '2px 6px', borderRadius: '4px', border: '1px solid #555' }}>←</kbd> <kbd style={{ background: '#0b0c10', padding: '2px 6px', borderRadius: '4px', border: '1px solid #555' }}>→</kbd></td>
              <td style={{ padding: '8px' }}>Muoviti tra le carte in mano</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '8px' }}><kbd style={{ background: '#0b0c10', padding: '2px 6px', borderRadius: '4px', border: '1px solid #555' }}>Spazio</kbd></td>
              <td style={{ padding: '8px' }}>Seleziona / Deseleziona carta (max 5)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '8px' }}><kbd style={{ background: '#0b0c10', padding: '2px 6px', borderRadius: '4px', border: '1px solid #555' }}>J</kbd></td>
              <td style={{ padding: '8px' }}>Gioca la mano selezionata</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '8px' }}><kbd style={{ background: '#0b0c10', padding: '2px 6px', borderRadius: '4px', border: '1px solid #555' }}>S</kbd></td>
              <td style={{ padding: '8px' }}>Scarta le carte selezionate</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '8px' }}><kbd style={{ background: '#0b0c10', padding: '2px 6px', borderRadius: '4px', border: '1px solid #555' }}>V</kbd></td>
              <td style={{ padding: '8px' }}>Ordina la mano per Valore decrescente</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '8px' }}><kbd style={{ background: '#0b0c10', padding: '2px 6px', borderRadius: '4px', border: '1px solid #555' }}>C</kbd></td>
              <td style={{ padding: '8px' }}>Ordina la mano per Seme</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '8px' }}><kbd style={{ background: '#0b0c10', padding: '2px 6px', borderRadius: '4px', border: '1px solid #555' }}>?</kbd></td>
              <td style={{ padding: '8px' }}>Apri questa finestra di aiuto</td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}><kbd style={{ background: '#0b0c10', padding: '2px 6px', borderRadius: '4px', border: '1px solid #555' }}>Esc</kbd></td>
              <td style={{ padding: '8px' }}>Chiudi questa finestra di aiuto</td>
            </tr>
          </tbody>
        </table>

        <div style={{ textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Ho capito (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
