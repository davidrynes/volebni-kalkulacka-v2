import { useState, useEffect, useRef, useCallback, useMemo } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { Alert, AlertDescription } from './ui/alert';

// Definice typů
interface Otazka {
  id: number;
  text: string;
}

interface StranyOdpovedi {
  [strana: string]: number[];
}

type OdpovediUzivatele = Record<number, number>;

interface Vysledek {
  strana: string;
  shoda: number;
}

interface MoznostOdpovedi {
  value: number;
  label: string;
}

const VolebniKalkulacka = () => {
  // Skutečná data z Excel souboru - zabaleno do useMemo
  const otazky = useMemo<Otazka[]>(() => [
    { id: 1, text: "ČR by měla zastavit dodávku zbraní Ukrajině." },
    { id: 2, text: "Vláda by v letech 2026-2030 měla postupně navýšit výdaje na obranu nejméně na 3 % HDP." },
    { id: 3, text: "Zdanění prázdných a investičních bytů by se mělo zvýšit." },
    { id: 4, text: "Daňová výjimka pro tichá vína a cidery by měla být zrušena." },
    { id: 5, text: "Zrušení superhrubé mzdy, které snížilo zdanění zaměstnanců, si státní rozpočet nemůže dovolit." },
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
  ], []);

  // Skutečné odpovědi stran z Excel souboru - zabaleno do useMemo
  const stranyOdpovedi = useMemo<StranyOdpovedi>(() => ({
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
  }), []);

  // Bodová matice podle Excel souboru - zabaleno do useMemo
  const bodovaMatice = useMemo<Record<number, Record<number, number>>>(() => ({
    1: { 1: 10, 2: 7.5, 3: -7.5, 4: -10 },
    2: { 1: 7.5, 2: 10, 3: -5, 4: -7.5 },
    3: { 1: -7.5, 2: -5, 3: 10, 4: 7.5 },
    4: { 1: -10, 2: -7.5, 3: 7.5, 4: 10 }
  }), []);

  const moznostiOdpovedi: MoznostOdpovedi[] = [
    { value: 1, label: "Rozhodně ano" },
    { value: 2, label: "Spíše ano" },
    { value: 3, label: "Spíše ne" },
    { value: 4, label: "Rozhodně ne" }
  ];

  const [odpovedi, setOdpovedi] = useState<OdpovediUzivatele>({});
  const [zasadniOtazky, setZasadniOtazky] = useState<Set<number>>(new Set());
  const [zobrazitVysledky, setZobrazitVysledky] = useState<boolean>(false);
  const [zobrazitOdpovediStran, setZobrazitOdpovediStran] = useState<boolean>(false);
  const [zobrazitVsechnyStrany, setZobrazitVsechnyStrany] = useState<boolean>(false);
  const [aktivniOtazka, setAktivniOtazka] = useState<number>(0);
  const [limitUpozorneni, setLimitUpozorneni] = useState<boolean>(false);
  
  // Reference pro hlavní container
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reference pro sledování, zda byla data již odeslána
  const dataOdeslana = useRef<boolean>(false);

  // State pro tooltip
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const tooltipTimeoutRef = useRef<number | null>(null);

  const handleOdpoved = (otazkaId: number, hodnota: number) => {
    setOdpovedi(prev => ({ ...prev, [otazkaId]: hodnota }));
  };

  const handleZasadni = (otazkaId: number) => {
    setZasadniOtazky(prev => {
      const newSet = new Set(prev);
      if (newSet.has(otazkaId)) {
        newSet.delete(otazkaId);
        setLimitUpozorneni(false);
        return newSet;
      } else {
        // Kontrola limitu 5 zásadních otázek
        if (newSet.size >= 5) {
          setLimitUpozorneni(true);
          return newSet;
        }
        
        newSet.add(otazkaId);
        return newSet;
      }
    });
  };

  // Funkce pro výpočet shody - zabaleno do useCallback
  const vypocitejShodu = useCallback((stranaOdpovedi: number[]): number => {
    let kladneBody = 0;
    let zaporneBody = 0;
    let pocetDulezitych = 0;
    let pocetZodpovezenych = 0;

    otazky.forEach((otazka, index) => {
      const userOdpoved = odpovedi[otazka.id];
      const stranaOdpoved = stranyOdpovedi[index];
      
      if (userOdpoved) {
        pocetZodpovezenych++;
        const vaha = zasadniOtazky.has(otazka.id) ? 2 : 1;
        if (zasadniOtazky.has(otazka.id)) {
          pocetDulezitych++;
        }
        
        // Použití bodové matice z Excel souboru
        const bodyZaOtazku = bodovaMatice[userOdpoved][stranaOdpoved] * vaha;
        
        // Rozdělení na kladné a záporné body
        if (bodyZaOtazku > 0) {
          kladneBody += bodyZaOtazku;
        } else {
          zaporneBody += Math.abs(bodyZaOtazku);
        }
      }
    });

    // Pokud nejsou žádné odpovědi, vrátit 50%
    if (pocetZodpovezenych === 0) return 50;

    // Výpočet podle přesného vzorce z Excel souboru
    // Maximum bodů = (počet zodpovězených * 10) + (počet důležitých * 10)
    const maxBody = (pocetZodpovezenych * 10) + (pocetDulezitych * 10);
    
    // Finální vzorec: (kladné - záporné) / (max * 2) + 50%
    const shoda = ((kladneBody - zaporneBody) / (maxBody * 2) + 0.5) * 100;
    
    return Math.max(0, Math.min(100, Math.round(shoda)));
  }, [odpovedi, zasadniOtazky, bodovaMatice, otazky]);

  // Funkce pro odeslání anonymních dat
  const odesliAnonymniData = useCallback(async () => {
    try {
      const anonymniData = {
        odpovedi: Object.fromEntries(
          Object.entries(odpovedi).map(([id, hodnota]) => [id, hodnota])
        ),
        zasadniOtazky: Array.from(zasadniOtazky),
        timestamp: new Date().toISOString(),
        vysledky: Object.entries(stranyOdpovedi)
          .map(([strana, odpovediStrany]) => ({
            strana,
            shoda: vypocitejShodu(odpovediStrany)
          }))
          .sort((a, b) => b.shoda - a.shoda)
      };
      
    } catch (error) {
      console.error("Chyba při odesílání dat:", error);
    }
  }, [odpovedi, zasadniOtazky, stranyOdpovedi, vypocitejShodu]);

  useEffect(() => {
    // Odešleme anonymní data pouze jednou při prvním zobrazení výsledků
    if (zobrazitVysledky) {
      // Použijeme ref pro sledování, zda už byla data odeslána
      if (!dataOdeslana.current) {
        odesliAnonymniData();
        dataOdeslana.current = true;
      }
    } else {
      // Reset při novém vyplnění kalkulačky
      dataOdeslana.current = false;
    }
  }, [zobrazitVysledky, odesliAnonymniData]);

  const vysledky = zobrazitVysledky ? Object.entries(stranyOdpovedi)
    .map(([strana, odpovediStrany]) => ({
      strana,
      shoda: vypocitejShodu(odpovediStrany)
    }))
    .sort((a, b) => b.shoda - a.shoda) : [];

  const pocetZodpovezenych = Object.keys(odpovedi).length;
  const progress = (aktivniOtazka / (otazky.length - 1)) * 100;

  const stahnoutVysledek = () => {
    // Pevná velikost obrázku
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return; // Kontrola, zda je ctx definováno

    // Bílé pozadí
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Logo NMS
    const img = new Image();
    img.onload = () => {
      // Vykreslení loga
      ctx.drawImage(img, (canvas.width - 200) / 2, 50, 200, 100);
      
      // Nadpis
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText('Volební kalkulačka 2025', canvas.width / 2, 220);
      
      // Podnadpis
      ctx.font = '24px Arial';
      ctx.fillText('Moje shoda s politickými stranami', canvas.width / 2, 270);
      
      // Vykreslení výsledků
      const topVysledky = vysledky.slice(0, zobrazitVsechnyStrany ? vysledky.length : 5);
      const barHeight = 50;
      const barGap = 20;
      const barWidth = 800;
      const startY = 350;
      
      topVysledky.forEach((vysledek, index) => {
        const y = startY + index * (barHeight + barGap);
        
        // Pozadí pruhu
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect((canvas.width - barWidth) / 2, y, barWidth, barHeight);
        
        // Barevný pruh podle shody
        ctx.fillStyle = getBarColor(vysledek.shoda);
        ctx.fillRect((canvas.width - barWidth) / 2, y, (vysledek.shoda / 100) * barWidth, barHeight);
        
        // Text strany
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(vysledek.strana, (canvas.width - barWidth) / 2 + 20, y + 32);
        
        // Procento shody
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${vysledek.shoda}%`, (canvas.width + barWidth) / 2 - 20, y + 32);
      });
      
      // Patička
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('www.nms.cz/volebni-kalkulacka', canvas.width / 2, canvas.height - 50);
      
      // Stažení obrázku
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'volebni-kalkulacka-vysledek.png';
      link.href = dataUrl;
      link.click();
    };
    
    // Načtení obrázku loga
    img.src = '/nms.png'; // Předpokládáme, že logo je ve veřejné složce
  };
  
  // Funkce pro získání barvy pruhu podle shody
  const getBarColor = (shoda: number): string => {
    if (shoda >= 80) return '#4CAF50'; // Zelená pro vysokou shodu
    if (shoda >= 60) return '#8BC34A'; // Světle zelená
    if (shoda >= 40) return '#FFEB3B'; // Žlutá
    if (shoda >= 20) return '#FF9800'; // Oranžová
    return '#F44336'; // Červená pro nízkou shodu
  };

  const resetKalkulacky = () => {
    setOdpovedi({});
    setZasadniOtazky(new Set());
    setZobrazitVysledky(false);
    setZobrazitOdpovediStran(false);
    setZobrazitVsechnyStrany(false);
    setAktivniOtazka(0);
    setLimitUpozorneni(false);
    dataOdeslana.current = false;
  };

  const dalsiOtazka = () => {
    if (aktivniOtazka < otazky.length - 1) {
      setAktivniOtazka(prev => prev + 1);
      containerRef.current?.scrollTo(0, 0);
    } else {
      setZobrazitVysledky(true);
    }
  };

  const predchoziOtazka = () => {
    if (aktivniOtazka > 0) {
      setAktivniOtazka(prev => prev - 1);
      containerRef.current?.scrollTo(0, 0);
    }
  };

  const getOdpovedLabel = (value: number): string => {
    const moznost = moznostiOdpovedi.find(m => m.value === value);
    return moznost ? moznost.label : '';
  };

  const showTooltip = (otazkaId: number) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setActiveTooltip(otazkaId);
  };

  const hideTooltip = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    tooltipTimeoutRef.current = window.setTimeout(() => {
      setActiveTooltip(null);
    }, 300) as unknown as number;
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <img src="/nms.png" alt="NMS Logo" className="h-12" />
        </div>
        <CardTitle className="text-center">Volební kalkulačka 2025</CardTitle>
        <CardDescription className="text-center">
          Porovnejte své politické postoje s programy hlavních politických stran
        </CardDescription>
      </CardHeader>
      <CardContent ref={containerRef} className="max-h-[70vh] overflow-y-auto">
        {!zobrazitVysledky ? (
          <div>
            <Progress value={progress} className="mb-6" />
            
            <div className="text-center mb-6">
              <span className="text-sm text-gray-500">
                Otázka {aktivniOtazka + 1} z {otazky.length}
              </span>
            </div>
            
            <h3 className="text-xl font-bold mb-6">
              {otazky[aktivniOtazka].text}
            </h3>
            
            <div className="grid gap-4 mb-6">
              {moznostiOdpovedi.map((moznost) => (
                <Button
                  key={moznost.value}
                  variant={odpovedi[otazky[aktivniOtazka].id] === moznost.value ? 'default' : 'outline'}
                  className="w-full justify-start text-left"
                  onClick={() => handleOdpoved(otazky[aktivniOtazka].id, moznost.value)}
                >
                  {moznost.label}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center space-x-2 mb-8">
              <Checkbox
                id={`zasadni-${otazky[aktivniOtazka].id}`}
                checked={zasadniOtazky.has(otazky[aktivniOtazka].id)}
                onCheckedChange={() => handleZasadni(otazky[aktivniOtazka].id)}
              />
              <Label htmlFor={`zasadni-${otazky[aktivniOtazka].id}`}>
                Toto téma je pro mě zásadní (max. 5)
              </Label>
            </div>
            
            {limitUpozorneni && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  Můžete vybrat maximálně 5 zásadních otázek.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={predchoziOtazka}
                disabled={aktivniOtazka === 0}
                className="flex items-center gap-1"
              >
                <span>Zpět</span>
              </Button>
              
              <Button
                onClick={dalsiOtazka}
                className="flex items-center gap-1"
              >
                <span>{aktivniOtazka === otazky.length - 1 ? 'Zobrazit výsledky' : 'Další'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold mb-6">
              Výsledky - Vaše shoda s politickými stranami
            </h3>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-4">
                Zodpovězeno {pocetZodpovezenych} z {otazky.length} otázek.
                {zasadniOtazky.size > 0 && ` Označeno ${zasadniOtazky.size} zásadních otázek.`}
              </p>
              
              {(zobrazitVsechnyStrany ? vysledky : vysledky.slice(0, 5)).map((vysledek) => (
                <div key={vysledek.strana} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{vysledek.strana}</span>
                    <span className="font-bold">{vysledek.shoda}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full"
                      style={{
                        width: `${vysledek.shoda}%`,
                        backgroundColor: getBarColor(vysledek.shoda)
                      }}
                    />
                  </div>
                </div>
              ))}
              
              {!zobrazitVsechnyStrany && vysledky.length > 5 && (
                <Button
                  variant="outline"
                  onClick={() => setZobrazitVsechnyStrany(true)}
                  className="w-full mt-2"
                >
                  Zobrazit všechny strany
                </Button>
              )}
              
              {zobrazitVsechnyStrany && (
                <Button
                  variant="outline"
                  onClick={() => setZobrazitVsechnyStrany(false)}
                  className="w-full mt-2"
                >
                  Zobrazit pouze top 5 stran
                </Button>
              )}
            </div>
            
            <div className="flex flex-col gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setZobrazitOdpovediStran(!zobrazitOdpovediStran)}
                className="flex items-center gap-2"
              >
                {zobrazitOdpovediStran ? 'Skrýt odpovědi stran' : 'Zobrazit odpovědi stran'}
              </Button>
              
              <Button
                variant="outline"
                onClick={stahnoutVysledek}
                className="flex items-center gap-2"
              >
                Stáhnout výsledek jako obrázek
              </Button>
              
              <Button
                variant="outline"
                onClick={resetKalkulacky}
                className="flex items-center gap-2"
              >
                Začít znovu
              </Button>
            </div>
            
            {zobrazitOdpovediStran && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Odpovědi politických stran</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-100">
                      <tr>
                        <th className="px-4 py-2">Strana</th>
                        {otazky.map((otazka) => (
                          <th 
                            key={otazka.id} 
                            className="px-2 py-2 text-center relative"
                            onMouseEnter={() => showTooltip(otazka.id)}
                            onMouseLeave={hideTooltip}
                          >
                            {otazka.id}
                            {activeTooltip === otazka.id && (
                              <div className="absolute z-10 bg-black text-white text-xs rounded py-1 px-2 left-1/2 transform -translate-x-1/2 bottom-full mb-1 w-48">
                                {otazka.text}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stranyOdpovedi).map(([strana, odpovediStrany]) => (
                        <tr key={strana} className="border-b">
                          <td className="px-4 py-2 font-medium">{strana}</td>
                          {odpovediStrany.map((odpoved, index) => (
                            <td key={index} className="px-2 py-2 text-center">
                              {getOdpovedLabel(odpoved)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VolebniKalkulacka; 