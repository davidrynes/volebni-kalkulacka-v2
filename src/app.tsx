import "./app.css"; 
import { VolebniKalkulacka } from "./components/volebni-kalkulacka";
import { getOtazky } from "./services/dataService";

// Načtení otázek včetně popisů z dataService
const otazky = getOtazky();

// Odpovědi politických stran na otázky
const stranyOdpovedi = {
  "Přísaha": [3, 1, 4, 4, 2, 3, 1, 1, 2, 3, 1, 4, 4, 4, 1],
  "Piráti+Zelení": [4, 1, 2, 1, 2, 2, 2, 1, 4, 2, 4, 1, 4, 2, 3],
  "SPD": [1, 4, 4, 4, 4, 4, 1, 1, 1, 4, 1, 4, 1, 3, 1],
  "STAN": [4, 1, 2, 1, 1, 1, 4, 3, 4, 2, 4, 1, 4, 1, 4],
  "Stačilo!": [1, 4, 2, 2, 3, 1, 1, 1, 1, 4, 1, 4, 1, 4, 1],
  "Motoristé": [3, 2, 4, 3, 4, 4, 4, 3, 1, 3, 3, 4, 4, 1, 1],
  "Spolu": [4, 1, 3, 3, 3, 3, 3, 3, 3, 2, 4, 2, 4, 2, 2],
  "ANO": [3, 2, 3, 4, 4, 4, 3, 2, 2, 3, 1, 3, 4, 3, 2]
};

// Bodová matice pro výpočet shody
const bodovaMatice = {
  1: { 1: 10, 2: 7.5, 3: -7.5, 4: -10 },
  2: { 1: 7.5, 2: 10, 3: -5, 4: -7.5 },
  3: { 1: -7.5, 2: -5, 3: 10, 4: 7.5 },
  4: { 1: -10, 2: -7.5, 3: 7.5, 4: 10 }
};

// Hlavní aplikační komponenta
export function App() { 
  return (
    <div className="app-container" data-dot="sc-volebni-kalkulacka-poslanecke-volby-2025">
      <VolebniKalkulacka 
        otazky={otazky} 
        stranyOdpovedi={stranyOdpovedi} 
        bodovaMatice={bodovaMatice} 
      />
    </div>
  );
}
