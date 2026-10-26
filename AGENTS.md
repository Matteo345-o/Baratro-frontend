# Stellaris
## Stack
- React 19 + Vite 6
- TypeScript 5.7
- Nessun meta-framework, niente Next.js
- Pubblicazione su Vercel
## Gioco
- Gioco di carte a turni accessibile ispirato a Balatro a tema spaziale (Pianeti, Stelle, Comete, Galassie)
- Logica di gioco in `src/game/`, separata dai componenti React
- 3 round con punteggi target: 300, 600, 1000 punti
- 4 mani e 3 scarti per round
## Regole
- Tutto giocabile da tastiera, focus sempre visibile e mai perso dopo le azioni
- Pattern ARIA secondo le WAI-ARIA Authoring Practices (Listbox con roving tabindex, dialoghi per aiuto, live regions per annunci)
- Contrasto colori WCAG AA, animazioni con prefers-reduced-motion
- Nessuna nuova dipendenza senza autorizzazione
