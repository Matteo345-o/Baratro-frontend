# AstroBalatro - Un Balatro Accessibile

Gioco di carte roguelike accessibile a tema spaziale, sviluppato per l'esercitazione ITS di sviluppo web assistito con AI.

---

## 1. Blocco di contesto usato con l'AI

```markdown
# AstroBalatro
## Stack
- React 19 + Vite 6
- TypeScript 5.7
- Nessun meta-framework, niente Next.js
- Pubblicazione su Vercel
## Gioco
- Gioco di carte a turni accessibile ispirato a Balatro a tema spaziale (Pianeti, Stelle, Comete, Galassie)
- Logica di gioco in src/game/, separata dai componenti React
- 3 round con punteggi target: 300, 600, 1000 punti
- 4 mani e 3 scarti per round
## Regole
- Tutto giocabile da tastiera, focus sempre visibile e mai perso dopo le azioni
- Pattern ARIA secondo le WAI-ARIA Authoring Practices (Listbox con roving tabindex, dialoghi per aiuto, live regions per annunci)
- Contrasto colori WCAG AA, animazioni con prefers-reduced-motion
- Nessuna nuova dipendenza senza autorizzazione
```

---

## 2. Librerie scelte e motivazione

- **React 19 & React-DOM 19**: Standard moderno per la gestione dichiarativa dell'interfaccia a componenti e dello stato reattivo.
- **Vite 6**: Bundler ultra-rapido con supporto nativo ES Modules, ricaricamento a caldo (HMR) e build ottimizzata per Vercel.
- **TypeScript 5.7**: Tipizzazione statica per garantire l'integrità del modello dati delle carte, dei ranghi, semi e calcolo punteggi senza bug a runtime.
- **Nessuna libreria UI o CSS esterna**: Tutto lo stile è in CSS puro con token accessibili (colori ad alto contrasto, min-touch target di 44px, reset overflow per 360px), senza dipendenze pesanti o superflue.

---

## 3. Fonti consultate sull'accessibilità (A11y)

1. **W3C WAI-ARIA Authoring Practices Guide (APG)**:
   - Pattern *Listbox* per la selezione multipla delle carte e navigazione orizzontale con Roving Tabindex.
   - Pattern *Dialog (Modal)* per la finestra di aiuto dei comandi da tastiera (`role="dialog"`, `aria-modal="true"`, chiusura su `Escape`).
   - Pattern *Live Region* (`role="status"`, `aria-live="polite"`) per l'annuncio dei risultati di ogni mano.
2. **Linee Guida WCAG 2.1 (Livello AA)**:
   - Criterio 1.4.3 (Contrasto minimo 4.5:1 per testo normale, 3:1 per componenti UI).
   - Criterio 2.1.1 (Tastiera - tutta la funzionalità è disponibile da tastiera).
   - Criterio 2.4.7 (Focus visibile - focus-visible sempre nitido e mai nascosto).
   - Criterio 2.5.5 / 2.5.8 (Target size di almeno 24x24px, ottimale 44x44px).
   - Criterio 2.3.3 (Animazioni disattivabili con media query `prefers-reduced-motion`).

---

## 4. Diario dell'AI: dove ha sbagliato e come ce ne siamo accorti

Come previsto dal metodo di lavoro con l'AI e dalla lezione sul prompt engineering, analizzare e correggere le allucinazioni o gli errori dell'AI è fondamentale:

1. **Struttura dei file e percorsi degli import errati**:
   - *Cosa ha fatto l'AI*: Ha generato frammenti con percorsi relativi come `../game/logic` e `./PlayingCard`, ma i file sono stati salvati nella cartella radice con nomi disallineati (ad esempio `playingcart.tsx` con la "t").
   - *Come ce ne siamo accorti*: TypeScript segnalava errore di modulo non trovato (`Cannot find module`) e la build non poteva partire.
   - *Come è stato risolto*: Abbiamo organizzato la struttura standard raccomandata (`src/game/`, `src/components/`, `src/main.tsx`), normalizzato i nomi dei file e configurato `package.json` e `tsconfig.json`.

2. **Roving Tabindex statico e Focus perso (Bug critico di accessibilità)**:
   - *Cosa ha fatto l'AI*: Ha inserito `tabIndex={index === 0 ? 0 : -1}` statico dentro `Hand.tsx`. Quando l'utente premeva le frecce per scorrere le carte, il tabindex non veniva aggiornato nello stato; premendo Tab per uscire e rientrare, il focus tornava sempre alla prima carta. Inoltre, quando le carte venivano giocate o scartate, il focus svaniva nel `<body>`.
   - *Come ce ne siamo accorti*: Testando la navigazione solo da tastiera come richiesto dalla specifica (Passo 4).
   - *Come è stato risolto*: Abbiamo implementato un vero roving tabindex con `focusedIndex` dinamico e un effetto di riposizionamento intelligente del focus che preserva la posizione sulla mano dopo il pescaggio di nuove carte.

3. **Gerarchia WAI-ARIA errata tra Listbox e Option**:
   - *Cosa ha fatto l'AI*: Il contenitore aveva `role="listbox"`, ma conteneva un `div.card-wrapper` generico a cui era associato il focus, mentre `role="option"` e `aria-selected` erano dentro il componente figlio `PlayingCard`.
   - *Come ce ne siamo accorti*: Testando con uno screen reader (NVDA), le carte venivano lette come semplici divisioni senza annunciare il nome o lo stato di selezione.
   - *Come è stato risolto*: Spostato il ruolo `role="option"`, `aria-selected` e `aria-label` direttamente sull'elemento focabile con tabindex, garantendo che lo screen reader annunci ad esempio: *"Regina di Galassie, valore 10, non selezionata"*.

4. **Combinazioni poker mancanti nella logica**:
   - *Cosa ha fatto l'AI*: Aveva implementato solo Poker, Full, Tris, Doppia Coppia, Coppia e Carta Alta, commentando che avrebbe aggiunto Scala e Colore in seguito.
   - *Come ce ne siamo accorti*: Verificando i requisiti della tabella punteggi del documento ITS (Slide 5), dove Scala, Colore e Scala Colore sono obbligatorie.
   - *Come è stato risolto*: Aggiunto il riconoscimento di Scala (inclusa scala con Asso basso A-2-3-4-5), Colore e Scala Colore, con calcolo esatto dei punteggi secondo la formula `(fiches combinazione + fiches carte valide) * moltiplicatore`.

---

## 5. Come avviare il progetto in locale

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo Vite
npm run dev

# Esegui la build di produzione per Vercel
npm run build
```
