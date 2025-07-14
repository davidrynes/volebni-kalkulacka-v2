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