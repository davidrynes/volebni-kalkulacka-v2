import "./app.css"; 
import { VolebniKalkulacka } from "./components/volebni-kalkulacka";

// Otázky pro volební kalkulačku
const otazky = [
  { id: 1, text: "ČR by měla zastavit dodávku zbraní Ukrajině." }, 
  { id: 2, text: "Vláda by v letech 2026-2030 měla postupně navýšit výdaje na obranu nejméně na 3 % HDP." }, 
  { id: 3, text: "Zdanění prázdných a investičních bytů by se mělo zvýšit." }, 
  { id: 4, text: "Daňová výjimka pro tichá vína a cidery by měla být zrušena." }, 
  { id: 5, text: "Bylo zrušení superhrubé mzdy, které snížilo zdanění zaměstnanců, chybou, jakou si státní rozpočet nemůže dovolit?" }, 
  { id: 6, text: "Progresivní zdanění příjmů by mělo být rozšířeno." }, 
  { id: 7, text: "Nadnárodní korporace by měly být v ČR mnohem více zdaněny." }, 
  { id: 8, text: "Minimální mzda by měla být vyšší." }, 
  { id: 9, text: "ČR by měla odložit plánovaný odchod od uhlí." }, 
  { id: 10, text: "Zvýšení legální migrace je zásadní pro český trh práce a ekonomický růst." }, 
  { id: 11, text: "Česká televize a Český rozhlas by se měly sloučit a být financovány přímo ze státního rozpočtu, nikoli z koncesionářských poplatků." }, 
  { id: 12, text: "ČR by měla do roku 2030 přijmout jednotnou evropskou měnu (Euro)." }, 
  { id: 13, text: "Mělo by být vypsáno referendum o vystoupení ČR z EU." }, 
  { id: 14, text: "Pacienti by měli mít možnost připlatit si za nadstandardní zdravotní péči v nemocnicích." }, 
  { id: 15, text: "ČR by měla usilovat o zrušení Green Dealu (Zelené dohody pro Evropu)." }
];

// Odpovědi politických stran na otázky
const stranyOdpovedi = {
  "Přísaha": [3, 1, 4, 4, 2, 3, 1, 1, 2, 3, 1, 4, 4, 4, 1],
  "Piráti": [4, 1, 2, 1, 2, 2, 2, 1, 4, 2, 4, 1, 4, 2, 3],
  "SPD": [1, 4, 4, 4, 4, 4, 1, 1, 1, 4, 1, 4, 1, 3, 1],
  "Zelení": [4, 2, 1, 1, 1, 2, 1, 1, 4, 1, 4, 1, 4, 4, 4],
  "STAN": [4, 1, 2, 1, 1, 1, 4, 3, 4, 2, 4, 1, 4, 1, 4],
  "Stačilo!": [1, 4, 2, 2, 3, 1, 1, 1, 1, 4, 1, 4, 1, 4, 1],
  "Motoristé": [3, 2, 4, 3, 4, 4, 4, 3, 1, 3, 3, 4, 4, 1, 1],
  "SocDem": [4, 4, 1, 1, 2, 1, 1, 1, 3, 2, 3, 3, 4, 4, 3],
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
    <div className="app-container">
      <VolebniKalkulacka 
        otazky={otazky} 
        stranyOdpovedi={stranyOdpovedi} 
        bodovaMatice={bodovaMatice} 
      />
    </div>
  );
}
