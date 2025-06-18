"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Download, Eye, EyeOff, RefreshCw, Info, Calculator, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';

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
  // Skutečná data z Excel souboru
  const otazky: Otazka[] = [
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
  ];

  // Skutečné odpovědi stran z Excel souboru
  const stranyOdpovedi: StranyOdpovedi = {
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

  // Bodová matice podle Excel souboru
  const bodovaMatice: Record<number, Record<number, number>> = {
    1: { 1: 10, 2: 7.5, 3: -7.5, 4: -10 },
    2: { 1: 7.5, 2: 10, 3: -5, 4: -7.5 },
    3: { 1: -7.5, 2: -5, 3: 10, 4: 7.5 },
    4: { 1: -10, 2: -7.5, 3: 7.5, 4: 10 }
  };

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
  
  // Reference pro hlavní container
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Odešleme anonymní data při zobrazení výsledků
    if (zobrazitVysledky) {
      odesliAnonymniData();
    }
  }, [zobrazitVysledky]);

  // Funkce pro odeslání anonymních dat
  const odesliAnonymniData = async () => {
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
      console.log("Odesílám anonymní data:", anonymniData);
      
      // Volání API pro ukládání dat
      await fetch('/api/ulozit-odpovedi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(anonymniData)
      });
    } catch (error) {
      console.error("Chyba při odesílání dat:", error);
    }
  };

  const handleOdpoved = (otazkaId: number, hodnota: number) => {
    setOdpovedi(prev => ({ ...prev, [otazkaId]: hodnota }));
  };

  const handleZasadni = (otazkaId: number) => {
    setZasadniOtazky(prev => {
      const newSet = new Set(prev);
      if (newSet.has(otazkaId)) {
        newSet.delete(otazkaId);
      } else {
        newSet.add(otazkaId);
      }
      return newSet;
    });
  };

  // Funkce pro slider - převede hodnotu slideru (0-3) na hodnotu odpovědi (1-4)
  const handleSliderChange = (otazkaId: number, hodnota: number[]) => {
    handleOdpoved(otazkaId, hodnota[0] + 1); // +1 protože slider je 0-3, ale odpovědi jsou 1-4
  };

  const vypocitejShodu = (stranaOdpovedi: number[]): number => {
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
  };

  const vysledky = zobrazitVysledky ? Object.entries(stranyOdpovedi)
    .map(([strana, odpovediStrany]) => ({
      strana,
      shoda: vypocitejShodu(odpovediStrany)
    }))
    .sort((a, b) => b.shoda - a.shoda) : [];

  const pocetZodpovezenych = Object.keys(odpovedi).length;
  const progress = (aktivniOtazka / (otazky.length - 1)) * 100;

  const stahnoutVysledek = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return; // Kontrola, zda je ctx definováno

    // Bílé pozadí
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Logo/hlavička
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, 100);
    
    // Nadpis
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Volební kalkulačka 2025', 400, 45);
    
    ctx.font = '18px Arial';
    ctx.fillText('Moje výsledky', 400, 75);

    // Datum
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    const datum = new Date().toLocaleDateString('cs-CZ');
    ctx.fillText(`Vyplněno: ${datum}`, 750, 130);

    // Výsledky
    ctx.textAlign = 'left';
    vysledky.forEach((vysledek, index) => {
      const y = 180 + (index * 70);
      
      // Pozadí pro každý výsledek
      if (index < 10) { // Zobrazíme max 10 stran
        ctx.fillStyle = index === 0 ? '#dbeafe' : '#f3f4f6';
        ctx.fillRect(50, y - 30, 700, 60);
        
        // Pořadí
        ctx.fillStyle = index === 0 ? '#1e40af' : '#6b7280';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`${index + 1}.`, 70, y);
        
        // Název strany
        ctx.fillStyle = '#1f2937';
        ctx.font = '20px Arial';
        ctx.fillText(vysledek.strana, 110, y);
        
        // Procenta shody
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'right';
        ctx.fillStyle = index === 0 ? '#1e40af' : '#6b7280';
        ctx.fillText(`${vysledek.shoda}%`, 650, y);
        
        // Text "shoda"
        ctx.font = '14px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('shoda', 700, y);
        
        ctx.textAlign = 'left';
      }
    });

    // Patička
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('www.novinky.cz | Volební kalkulačka', 400, canvas.height - 15);

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
  const odpovediToSliderValue = (odpoved: number | undefined): number[] | undefined => {
    return odpoved ? [odpoved - 1] : undefined;
  };

  return (
    <div 
      className="bg-white" 
      ref={containerRef} 
      style={{ 
        width: '800px', 
        height: '600px', 
        margin: '0 auto',
        overflow: 'hidden',
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

        <main className="flex-grow p-6 overflow-hidden">
          {!zobrazitVysledky ? (
            <div className="h-full flex flex-col">
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
                
                <div className="space-y-8 flex-grow">
                  {/* Slider a textové odpovědi */}
                  <div className="mt-6">
                    <div className="px-2 flex justify-between text-sm text-gray-600 mb-2">
                      {moznostiOdpovedi.map((moznost, index) => (
                        <span 
                          key={moznost.value} 
                          className={`font-medium cursor-pointer transition-colors ${
                            odpovedi[otazky[aktivniOtazka].id] === moznost.value 
                              ? index < 2 ? 'text-green-600 font-bold' : 'text-red-600 font-bold' 
                              : index < 2 ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600'
                          }`}
                          onClick={() => handleOdpoved(otazky[aktivniOtazka].id, moznost.value)}
                        >
                          {moznost.label}
                        </span>
                      ))}
                    </div>
                    
                    <Slider 
                      value={odpovediToSliderValue(odpovedi[otazky[aktivniOtazka].id])}
                      min={0}
                      max={3}
                      step={1}
                      onValueChange={(value) => handleSliderChange(otazky[aktivniOtazka].id, value)}
                      className="mt-2"
                      aria-label="Vyberte odpověď"
                    />
                    
                    <div className="mt-2 text-center">
                      {odpovedi[otazky[aktivniOtazka].id] ? (
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {getOdpovedLabel(odpovedi[otazky[aktivniOtazka].id])}
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                          Prosím vyberte odpověď
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Checkbox pro zásadní otázky */}
                  <div className="mt-auto pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`zasadni-${otazky[aktivniOtazka].id}`}
                        checked={zasadniOtazky.has(otazky[aktivniOtazka].id)}
                        onCheckedChange={() => handleZasadni(otazky[aktivniOtazka].id)}
                      />
                      <Label htmlFor={`zasadni-${otazky[aktivniOtazka].id}`} className="cursor-pointer">
                        Tato otázka je pro mě zásadní (dvojnásobná váha)
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Navigační tlačítka */}
              <div className="mt-6 flex justify-between">
                <Button
                  onClick={predchoziOtazka}
                  disabled={aktivniOtazka === 0}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Zpět
                </Button>
                
                <Button
                  onClick={dalsiOtazka}
                  disabled={!odpovedi[otazky[aktivniOtazka].id]}
                  className="flex items-center gap-1"
                >
                  {aktivniOtazka === otazky.length - 1 ? 'Zobrazit výsledky' : 'Další'}
                  {aktivniOtazka !== otazky.length - 1 && <ChevronRight className="w-4 h-4" />}
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
                              <td className="p-2">
                                <span className="font-semibold text-gray-600">{otazka.id}.</span>
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