import { OdpovediUzivatele } from '../components/volebni-kalkulacka';

interface SavingData {
  odpovedi: OdpovediUzivatele;
  zasadniOtazky: number[];
  zarizeni: string;
  kraj?: string;
  timestamp: number;
}

// Detekce zařízení
export const getDeviceInfo = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Mapování krajů ČR na kódy krajů
const regionMapping: Record<string, string> = {
  "Praha": "PHA",
  "Středočeský kraj": "STC",
  "Jihočeský kraj": "JHC",
  "Plzeňský kraj": "PLK",
  "Karlovarský kraj": "KVK",
  "Ústecký kraj": "ULK",
  "Liberecký kraj": "LBK",
  "Královéhradecký kraj": "HKK",
  "Pardubický kraj": "PAK",
  "Kraj Vysočina": "VYS",
  "Jihomoravský kraj": "JHM",
  "Olomoucký kraj": "OLK",
  "Zlínský kraj": "ZLK",
  "Moravskoslezský kraj": "MSK"
};

// Detekce kraje - náhradní řešení bez externího API
export const detectRegion = async (): Promise<string | undefined> => {
  try {
    // Vzhledem k omezením CORS a limitům API, použijeme zjednodušenou detekci
    // V produkčním prostředí by bylo ideální implementovat serverové řešení
    
    // Pro účely testování vrátíme náhodný kraj
    // V produkci by tato funkce byla nahrazena serverovým voláním
    const kraje = Object.values(regionMapping);
    const randomKraj = kraje[Math.floor(Math.random() * kraje.length)];
    
    // Simulace asynchronního volání
    return Promise.resolve(randomKraj);
    
    /* Původní implementace s externím API - ponecháno pro referenci
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      return undefined;
    }
    
    const data = await response.json();
    
    // Pokud nejsme v ČR, vrátíme undefined
    if (data.country !== 'CZ') {
      return undefined;
    }
    
    // Získáme region z API
    const region = data.region;
    
    // Pokusíme se namapovat region na kód kraje
    for (const [krajNazev, krajKod] of Object.entries(regionMapping)) {
      // Hledáme částečnou shodu, protože formát z API se může lišit
      if (region && krajNazev.toLowerCase().includes(region.toLowerCase()) || 
          region && region.toLowerCase().includes(krajNazev.toLowerCase())) {
        return krajKod;
      }
    }
    
    // Pokud máme město, můžeme zkusit odhadnout kraj
    if (data.city) {
      // Toto je velmi zjednodušené mapování velkých měst na kraje
      const cityMapping: Record<string, string> = {
        "Praha": "PHA",
        "Brno": "JHM",
        "Ostrava": "MSK",
        "Plzeň": "PLK",
        "Liberec": "LBK",
        "Olomouc": "OLK",
        "České Budějovice": "JHC",
        "Hradec Králové": "HKK",
        "Ústí nad Labem": "ULK",
        "Pardubice": "PAK",
        "Zlín": "ZLK",
        "Jihlava": "VYS",
        "Karlovy Vary": "KVK"
      };
      
      for (const [mesto, krajKod] of Object.entries(cityMapping)) {
        if (data.city.toLowerCase().includes(mesto.toLowerCase())) {
          return krajKod;
        }
      }
    }
    */
    
    return undefined;
  } catch (error) {
    return undefined;
  }
};

// Funkce pro ukládání odpovědí
export const saveUserData = async (
  odpovedi: OdpovediUzivatele, 
  zasadniOtazky: number[], 
  kraj?: string
): Promise<boolean> => {
  try {
    // Pokud nemáme zadaný kraj, pokusíme se ho detekovat
    let detectedRegion = kraj;
    if (!detectedRegion) {
      try {
        detectedRegion = await detectRegion();
      } catch (error) {
        // Tiché zpracování chyby
      }
    }
    
    const data: SavingData = {
      odpovedi,
      zasadniOtazky,
      zarizeni: getDeviceInfo(),
      kraj: detectedRegion,
      timestamp: Date.now()
    };
    
    // Odeslání dat na centrální endpoint API
    try {
      // Nastavení API endpoint URL 
      const apiUrl = '/api/ulozit-odpovedi';
      
      // Odeslání dat pomocí fetch API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        // Důležité pro multi-instance prostředí - nepoužívat credentials
        credentials: 'omit'
      });
      
      if (!response.ok) {
        console.error('Nepodařilo se uložit data na server', response.status);
        // Pokud server není dostupný, uložíme data lokálně jako zálohu
        try {
          localStorage.setItem('volebniKalkulacka_data', JSON.stringify(data));
        } catch (e) {
          // Tiché zpracování chyby
        }
        return false;
      }
      
      return true;
    } catch (error) {
      // V případě chyby při komunikaci se serverem, uložíme data lokálně
      try {
        localStorage.setItem('volebniKalkulacka_data', JSON.stringify(data));
      } catch (e) {
        // Tiché zpracování chyby
      }
      return false;
    }
  } catch (error) {
    return false;
  }
};

// Funkce pro získání otázek včetně popisů
export function getOtazky() {
  // Seznam otázek s jejich ID a popisem
  const otazky = [
    {
      id: 1,
      text: "ČR by měla zastavit dodávku zbraní Ukrajině.",
      popis: "V letech 2022-2024 poskytla ČR Ukrajině vojenské vybavení za 7,3 miliardy Kč, což představuje 0,34 % státního rozpočtu z roku 2024. Evropská unie tuto částku ČR částečně kompenzovala a zpět proplatila ČR 730 mil. Kč."
    },
    {
      id: 2,
      text: "Vláda by v letech 2026-2030 měla postupně navýšit výdaje na obranu nejméně na 3 % HDP.",
      popis: "V roce 2024 ČR splnila závazek výdajů na obranu ve výši 2 % HDP, což představovalo 7,6 % státního rozpočtu. Závazek aktuálně plní 23 z 32 států NATO a v červenci 2025 se spojenecké země dohodly do roku 2035 vydávat 5 % HDP na obranu. Z nich 3,5 % půjdou na armádu a 1,5 % na širší bezpečnostní výdaje jako kybernetickou bezpečnost či budování zdravotnických zařízení."
    },
    {
      id: 3,
      text: "Zdanění prázdných a investičních bytů by se mělo zvýšit.",
      popis: "Daň z nemovitosti v ČR tvoří 0,7 % daňových příjmů státu. Průměr zemí EU je 2,5 %. Specifické zdanění prázdných nemovitostí existuje v Anglii, Francii, Portugalsku či Belgii."
    },
    {
      id: 4,
      text: "Daňová výjimka pro tichá vína a cidery by měla být zrušena.",
      popis: "Cílem daňové výjimky je podpora českých vinařů. Od daně je nicméně osvobozeno i dovezené víno. Daň za litr čistého alkoholu v tvrdém alkoholu je přibližně 320 Kč, v pivě přibližně 80 Kč, v šumivém víně 210 Kč, v tichém víně 0 Kč. Zdanění tichého vína by státnímu rozpočtu přineslo 4 až 5 mld. Kč."
    },
    {
      id: 5,
      text: "Zrušení superhrubé mzdy, které snížilo zdanění zaměstnanců, si státní rozpočet nemůže dovolit.",
      popis: "Zrušení superhrubé mzdy snížilo příjmy veřejných rozpočtů v roce 2022 přibližně o 116-122 mld. Kč. Schodek státního rozpočtu v roce 2022, očištěný o příjmy z EU, byl 316 mld. Kč. Rozpočet na rok 2025 předpokládá schodek 241 miliard Kč a v roce 2026 pak 225 mld. Kč."
    },
    {
      id: 6,
      text: "Progresivní zdanění příjmů by mělo být rozšířeno.",
      popis: "Daně z příjmů fyzických osob v ČR jsou dle OECD jen spíše slabě progresivní. Aktuálně existují dvě daňová pásma – základní 15 % a 23 % na příjmy přibližně 1,68 mil. Kč (od 36násobku průměrné mzdy). Existující návrhy zdůrazňují zvýšení sazby pro horní pětinu nejvíce příjmových zaměstnanců."
    },
    {
      id: 7,
      text: "Nadnárodní korporace by měly být v ČR mnohem více zdaněny.",
      popis: "Od roku 2024 platí nová pravidla EU, která pro nadnárodní společnosti zavádějí minimální zdanění ve výši 15 %. Korporátní daň v ČR je nastavena na 21 %, což odpovídá průměru evropských zemí."
    },
    {
      id: 8,
      text: "Minimální mzda by měla být vyšší.",
      popis: "V roce 2025 je minimální mzda 20 800 Kč za měsíc nebo 124,40 Kč za hodinu. Dosahuje tak 42,2 % průměrné mzdy. Polská minimální mzda je ve výši přibližně 27 tis. Kč, Slovenská 20 tis. Kč."
    },
    {
      id: 9,
      text: "ČR by měla odložit plánovaný odchod od uhlí.",
      popis: "Vládou schválený konec spalování uhlí je 2033. Uhelná komise jako poradní orgán vlády původně doporučila rok 2038. Ze států EU chystají odchod od uhlí později než v roce 2033 pouze Německo, Polsko a Bulharsko."
    },
    {
      id: 10,
      text: "Zvýšení legální migrace je zásadní pro český trh práce a ekonomický růst.",
      popis: "V roce 2024 bylo v ČR registrováno 1,094 mil. osob cizí státní příslušnosti, tedy 10 % celkové populace. Převažují občané Ukrajiny (589 tis.), Slovenska (121 tis.) a Vietnamu (69 tis.). Ministerstvo práce a sociálních věcí uvádí pozitivní dopad migrace na ekonomiku, například Ukrajinci do státního rozpočtu přináší o 3,1 miliardy korun více, než stát vydává na jejich podporu."
    },
    {
      id: 11,
      text: "Česká televize a Český rozhlas by se měly sloučit a být financovány přímo ze státního rozpočtu, nikoli z koncesionářských poplatků.",
      popis: "Aktuálně jsou ČT i ČRo financovány skrze koncesionářské poplatky, které tvoří 150 Kč pro ČT a 55 Kč pro ČRo měsíčně. Model poplatků funguje například v Itálii, Německu, Polsku, Rakousku či Švýcarsku. Model financování ze státního rozpočtu například v Dánsku, Francii, Maďarsku, Norsku nebo Slovensku."
    },
    {
      id: 12,
      text: "ČR by měla do roku 2030 přijmout jednotnou evropskou měnu.",
      popis: "Společnou evropskou měnu aktuálně využívá 20 států a od roku 2026 se jako 21. přidá Bulharsko. Společnou měnu dosud nepřijaly Česko, Maďarsko, Polsko, Rumunsko a Švédsko."
    },
    {
      id: 13,
      text: "Mělo by být vypsáno referendum o vystoupení ČR z EU.",
      popis: "Referendum o vstupu do EU proběhlo v roce 2003 dle speciálního ústavního zákona a dodnes jde o jediné celostátní referendum v historii Česka. Český právní řád v současnosti umožňuje pouze místní a krajská referenda. Pro vstup do EU v roce 2003 hlasovalo 77 %, proti bylo 23 % a zúčastnilo se 55 % voličů."
    },
    {
      id: 14,
      text: "Pacienti by měli mít možnost připlatit si za nadstandardní zdravotní péči v nemocnicích.",
      popis: "Jedná se o zavedení legální možnosti připlácet si za lepší péči. Pacient by u nehrazených zdravotních služeb doplácel částku, o kterou stojí daná věc více než plně hrazená varianta. Zásadní by proto byla definice hrazených a nehrazených položek."
    },
    {
      id: 15,
      text: "ČR by měla usilovat o zrušení Green Dealu.",
      popis: "Tzv. Zelená dohoda pro Evropu má ambici snížit emise skleníkových plynů do roku 2030 alespoň o 55 % a do roku 2050 učinit z Evropy do klimaticky neutrální kontinent. Jedná se o příspěvek EU k Pařížské dohodě podepsané 195 státy, která má za cíl udržet globální oteplování na nejvýše 1,5 °C."
    }
  ];

  return otazky;
}

// Funkce pro získání nebo vytvoření ID instance
function getOrCreateInstanceId(): string {
  const storageKey = 'volebniKalkulacka_instanceId';
  
  // Pokus o načtení ID instance z localStorage
  let instanceId = localStorage.getItem(storageKey);
  
  // Pokud ID neexistuje, vytvoříme nové
  if (!instanceId) {
    instanceId = generateInstanceId();
    localStorage.setItem(storageKey, instanceId);
  }
  
  return instanceId;
}

// Funkce pro vygenerování náhodného ID instance
function generateInstanceId(): string {
  const randomPart = Math.random().toString(36).substring(2, 15);
  const timestampPart = Date.now().toString(36);
  return `${randomPart}${timestampPart}`;
} 