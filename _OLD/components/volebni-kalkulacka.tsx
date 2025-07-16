"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Info, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

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
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Funkce pro slider - převede hodnotu slideru (0-3) na hodnotu odpovědi (1-4)
  // Tato funkce již není potřeba, ale necháme ji zde pro kompatibilitu
  const handleSliderChange = (otazkaId: number, hodnota: number[]) => {
    handleOdpoved(otazkaId, hodnota[0] + 1); // +1 protože slider je 0-3, ale odpovědi jsou 1-4
  };

  // Funkce pro výpočet shody - zabaleno do useCallback
  const vypocitejShodu = useCallback((stranaOdpovedi: number[]): number => {
    let kladneBody = 0;
    let zaporneBody = 0;
    let pocetDulezitych = 0;
    let pocetZodpovezenych = 0;

    otazky.forEach((otazka, index) => {
      const userOdpoved = odpovedi[otazka.id];
      const stranaOdpoved = stranaOdpovedi[index];
      
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
      
      // Zde by bylo napojení na API endpoint pro ukládání dat
      
      // Volání API pro ukládání dat
      await fetch('/api/ulozit-odpovedi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(anonymniData)
      });
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

    // Logo/hlavička
    const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    headerGradient.addColorStop(0, '#2563eb'); // from-blue-600
    headerGradient.addColorStop(1, '#4f46e5'); // to-indigo-600
    
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, canvas.width, 150);
    
    // Nadpis
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Volební kalkulačka 2025', canvas.width / 2, 70);
    
    ctx.font = '24px Arial';
    ctx.fillText('Moje výsledky', canvas.width / 2, 110);

    // Datum
    ctx.fillStyle = '#6b7280';
    ctx.font = '18px Arial';
    ctx.textAlign = 'right';
    const datum = new Date().toLocaleDateString('cs-CZ');
    ctx.fillText(`Vyplněno: ${datum}`, canvas.width - 50, 200);

    // Výsledky
    ctx.textAlign = 'left';
    const stranyKZobrazit = zobrazitVsechnyStrany ? vysledky : vysledky.slice(0, 10);
    
    stranyKZobrazit.forEach((vysledek, index) => {
      const y = 280 + (index * 80); // Větší mezera mezi řádky pro lepší čitelnost
      
      // Pozadí pro každý výsledek
      ctx.fillStyle = index === 0 ? '#dbeafe' : (index % 2 === 0 ? '#f9fafb' : '#f3f4f6');
      ctx.fillRect(50, y - 40, canvas.width - 100, 70);
      
      if (index === 0) {
        // Zvýraznění prvního místa
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.strokeRect(50, y - 40, canvas.width - 100, 70);
      }
      
      // Pořadí
      ctx.fillStyle = index === 0 ? '#1e40af' : '#6b7280';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(`${index + 1}.`, 80, y + 5);
      
      // Název strany
      ctx.fillStyle = index === 0 ? '#1e3a8a' : '#1f2937';
      ctx.font = index === 0 ? 'bold 32px Arial' : '28px Arial';
      ctx.fillText(vysledek.strana, 140, y + 5);
      
      // Procenta shody
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'right';
      ctx.fillStyle = index === 0 ? '#1e40af' : '#6b7280';
      ctx.fillText(`${vysledek.shoda}%`, canvas.width - 150, y + 5);
      
      // Text "shoda"
      ctx.font = '18px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('shoda', canvas.width - 80, y + 5);
      
      ctx.textAlign = 'left';
    });

    // Patička
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('www.novinky.cz | Volební kalkulačka', canvas.width / 2, canvas.height - 25);

    // Stažení
    canvas.toBlob((blob) => {
      if (!blob) return; // Kontrola, zda blob není null
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `volebni-kalkulacka-${new Date().toISOString().split('T')[0]}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const resetKalkulacky = () => {
    setOdpovedi({});
    setZasadniOtazky(new Set());
    setZobrazitVysledky(false);
    setZobrazitOdpovediStran(false);
    setZobrazitVsechnyStrany(false);
    setAktivniOtazka(0);
    dataOdeslana.current = false; // Reset příznaku odeslání dat
  };

  const dalsiOtazka = () => {
    if (aktivniOtazka < otazky.length - 1) {
      setAktivniOtazka(prev => prev + 1);
    } else {
      setZobrazitVysledky(true);
    }
  };

  const predchoziOtazka = () => {
    if (aktivniOtazka > 0) {
      setAktivniOtazka(prev => prev - 1);
    }
  };

  // Získání slovního popisu podle hodnoty slideru
  const getOdpovedLabel = (value: number): string => {
    return moznostiOdpovedi.find(opt => opt.value === value)?.label || '';
  };

  // Převádí hodnotu odpovědi (1-4) na hodnotu slideru (0-3)
  // Pokud odpověď není vybrána, vrátí undefined místo defaultní hodnoty
  // Tato funkce již není potřeba, ale necháme ji zde pro kompatibilitu
  const odpovediToSliderValue = (odpoved: number | undefined): number[] | undefined => {
    return odpoved ? [odpoved - 1] : undefined;
  };

  // Funkce pro zobrazení tooltipu
  const showTooltip = (otazkaId: number) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setActiveTooltip(otazkaId);
  };

  // Funkce pro skrytí tooltipu s malým zpožděním
  const hideTooltip = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    tooltipTimeoutRef.current = setTimeout(() => {
      setActiveTooltip(null);
    }, 300);
  };

  return (
    <div 
      className="bg-white" 
      ref={containerRef} 
      style={{ 
        width: '800px', 
        height: '700px',
        margin: '0 auto',
        overflow: 'auto',
        position: 'relative',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="h-full flex flex-col">
        <header className="py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h1 className="text-xl font-bold">Volební kalkulačka 2025</h1>
          <p className="text-sm text-blue-100">Porovnejte své politické postoje s programy hlavních politických stran</p>
        </header>

        <main className="flex-grow p-6 overflow-auto">
          {!zobrazitVysledky ? (
            <div className="flex flex-col">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1 text-xs text-gray-500 font-medium">
                  <span>Otázka {aktivniOtazka + 1} z {otazky.length}</span>
                  <span>{Math.round(progress)}% dokončeno</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              {/* Slide s aktuální otázkou */}
              <div className="flex-grow flex flex-col">
                <div className="mb-6 border-b pb-4">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                      {otazky[aktivniOtazka].id}
                    </span>
                    <h3 className="font-bold text-xl">{otazky[aktivniOtazka].text}</h3>
                  </div>
                </div>
                
                <div className="space-y-8" style={{ minHeight: '200px' }}>
                  {/* Slider a textové odpovědi */}
                  <div className="mt-6">
                    <div className="flex flex-col gap-2">
                      {moznostiOdpovedi.map((moznost) => (
                        <button
                          key={moznost.value}
                          onClick={() => handleOdpoved(otazky[aktivniOtazka].id, moznost.value)}
                          className={`w-full py-3 px-4 text-left rounded-md transition-all border ${
                            odpovedi[otazky[aktivniOtazka].id] === moznost.value
                            ? moznost.value <= 2
                              ? 'bg-green-100 border-green-500 text-green-800'
                              : 'bg-red-100 border-red-500 text-red-800'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <span className="font-medium">{moznost.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Checkbox pro zásadní otázky */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`zasadni-${otazky[aktivniOtazka].id}`}
                        checked={zasadniOtazky.has(otazky[aktivniOtazka].id)}
                        onCheckedChange={() => handleZasadni(otazky[aktivniOtazka].id)}
                        disabled={!zasadniOtazky.has(otazky[aktivniOtazka].id) && zasadniOtazky.size >= 5}
                      />
                      <Label htmlFor={`zasadni-${otazky[aktivniOtazka].id}`} className="cursor-pointer">
                        Tato otázka je pro mě zásadní (dvojnásobná váha)
                      </Label>
                      <div className="text-xs text-gray-500 ml-1">
                        ({zasadniOtazky.size}/5)
                      </div>
                    </div>
                    
                    {limitUpozorneni && (
                      <Alert className="mt-2 bg-amber-50 text-amber-800 border-amber-200">
                        <Info className="h-4 w-4 mr-2" />
                        <AlertDescription>
                          Můžete označit maximálně 5 otázek jako zásadní.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Navigační tlačítka - výraznější */}
              <div className="mt-8 flex justify-between border-t pt-6 sticky bottom-0 bg-white">
                <Button
                  onClick={predchoziOtazka}
                  disabled={aktivniOtazka === 0}
                  variant="outline"
                  className="flex items-center gap-1 px-6 py-3 text-base border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 min-w-[120px]"
                >
                  <ChevronLeft className="w-5 h-5" /> Zpět
                </Button>
                
                <Button
                  onClick={dalsiOtazka}
                  disabled={!odpovedi[otazky[aktivniOtazka].id]}
                  className="flex items-center gap-1 px-6 py-3 text-base bg-blue-600 hover:bg-blue-700 text-white font-medium min-w-[120px] justify-center"
                >
                  {aktivniOtazka === otazky.length - 1 ? 'Zobrazit výsledky' : 'Další'}
                  {aktivniOtazka !== otazky.length - 1 && <ChevronRight className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto animate-in fade-in duration-500">
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Vaše výsledky</h2>
                <p className="text-sm text-gray-600">
                  Míra shody s politickými stranami na základě vašich odpovědí
                </p>
                
                <div className="space-y-2 mt-4">
                  {vysledky
                    .slice(0, zobrazitVsechnyStrany ? vysledky.length : 5)
                    .map((vysledek, index) => (
                      <div
                        key={vysledek.strana}
                        className={`flex justify-between items-center p-3 rounded-lg transition-all duration-300 ${
                          index === 0 ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-lg font-bold ${index === 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                            {index + 1}.
                          </span>
                          <span className={`font-medium ${index === 0 ? 'text-blue-900' : ''}`}>
                            {vysledek.strana}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="flex items-baseline gap-1">
                            <span className={`text-xl font-bold ${
                              index === 0 ? 'text-blue-600' : 'text-gray-700'
                            }`}>
                              {vysledek.shoda}
                            </span>
                            <span className="text-gray-600">%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {!zobrazitVsechnyStrany && vysledky.length > 5 && (
                      <Button
                        onClick={() => setZobrazitVsechnyStrany(true)}
                        variant="outline"
                        className="w-full mt-2 text-blue-600 hover:text-blue-700"
                      >
                        Zobrazit více stran
                      </Button>
                    )}
                    
                    {zobrazitVsechnyStrany && vysledky.length > 5 && (
                      <Button
                        onClick={() => setZobrazitVsechnyStrany(false)}
                        variant="outline"
                        className="w-full mt-2 text-blue-600 hover:text-blue-700"
                      >
                        Zobrazit pouze top 5 stran
                      </Button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mt-6">
                  <Button
                    onClick={stahnoutVysledek}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Stáhnout výsledky
                  </Button>
                  
                  <Button
                    onClick={() => setZobrazitOdpovediStran(!zobrazitOdpovediStran)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    {zobrazitOdpovediStran ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {zobrazitOdpovediStran ? 'Skrýt' : 'Zobrazit'} odpovědi stran
                  </Button>

                  <Button
                    onClick={resetKalkulacky}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Vyplnit znovu
                  </Button>
                </div>

                {zobrazitOdpovediStran && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Odpovědi politických stran</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b bg-gray-100">
                            <th className="text-left p-2">Otázka</th>
                            {Object.keys(stranyOdpovedi).map(strana => (
                              <th key={strana} className="text-center p-2 min-w-[80px]">
                                {strana}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {otazky.map((otazka, index) => (
                            <tr key={otazka.id} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="p-2 relative">
                                <span 
                                  className="font-semibold text-gray-600 cursor-help border-b border-dotted border-gray-400"
                                  onMouseEnter={() => showTooltip(otazka.id)}
                                  onMouseLeave={hideTooltip}
                                >
                                  {otazka.id}.
                                </span>
                                {activeTooltip === otazka.id && (
                                  <div 
                                    className="absolute z-50 bg-gray-900 text-white p-2 rounded-md shadow-lg max-w-xs text-xs"
                                    style={{ 
                                      top: '50%',
                                      left: '100%',
                                      transform: 'translateY(-50%)',
                                      marginLeft: '5px',
                                      width: 'max-content',
                                      maxWidth: '250px'
                                    }}
                                    onMouseEnter={() => showTooltip(otazka.id)}
                                    onMouseLeave={hideTooltip}
                                  >
                                    {otazka.text}
                                    <div 
                                      className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
                                      style={{
                                        left: '-3px',
                                        top: '50%',
                                        transform: 'translateY(-50%)'
                                      }}
                                    ></div>
                                  </div>
                                )}
                              </td>
                              {Object.entries(stranyOdpovedi).map(([strana, odpovedi]) => {
                                const odpoved = odpovedi[index];
                                const barva = odpoved <= 2 ? 'text-green-600' : 'text-red-600';
                                const bgBarva = odpoved <= 2 ? 'bg-green-50' : 'bg-red-50';
                                const symbol = odpoved === 1 ? '●●' : odpoved === 2 ? '●○' : odpoved === 3 ? '○●' : '○○';
                                return (
                                  <td key={strana} className={`text-center p-2`}>
                                    <span className={`inline-block px-1 rounded ${barva} ${bgBarva}`}>
                                      {symbol}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
        
        <footer className="py-2 px-6 bg-gray-50 text-center text-xs text-gray-500">
          <p>Volební kalkulačka 2025 | <a href="https://www.novinky.cz/" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">Novinky.cz</a> & <a href="https://nms.global/cz/" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">NMS</a></p>
        </footer>
      </div>
    </div>
  );
};

export default VolebniKalkulacka;