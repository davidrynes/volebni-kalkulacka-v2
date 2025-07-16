import { useState, useEffect, useRef, useCallback } from 'preact/hooks';

// Definice typů
interface Otazka {
  id: number;
  text: string;
  popis?: string;
}

interface StranyOdpovedi {
  [strana: string]: number[];
}

export type OdpovediUzivatele = Record<number, number>;

interface Vysledek {
  strana: string;
  shoda: number;
}

interface MoznostOdpovedi {
  value: number;
  label: string;
}

interface Props {
  otazky: Otazka[];
  odpovedi?: OdpovediUzivatele;
  stranyOdpovedi: StranyOdpovedi;
  bodovaMatice: Record<number, Record<number, number>>;
  onSubmit?: (userAnswers: Record<number, number>, crucialQuestions: number[]) => void;
}

// Popisy stran pro výsledky
const stranyPopis: Record<string, string> = {
  "Přísaha": "Přísaha je politické hnutí založené bývalým policistou Robertem Šlachtou.",
  "Piráti+Zelení": "Česká pirátská strana je liberální politická strana zaměřená na transparentnost a digitalizaci.",
  "SPD": "SPD je národně konzervativní politická strana vedená Tomiem Okamurou.",
  "STAN": "Starostové a nezávislí je středopravicová politická strana vycházející z komunální politiky.",
  "Stačilo!": "Stačilo! je levicové politické hnutí vedené Kateřinou Konečnou.",
  "Motoristé": "Motoristé sobě je politické hnutí zaměřené na práva řidičů a dopravní problematiku.",
  "Spolu": "SPOLU je středopravicová koalice stran ODS, KDU-ČSL a TOP 09.",
  "ANO": "Hnutí ANO je centristické politické hnutí založené Andrejem Babišem.",
};

// Barvy stran pro progress bar
const stranyBarvy: Record<string, string> = {
  "Přísaha": "#03f",
  "Piráti+Zelení": "#444444",
  "SPD": "#844e4e",
  "STAN": "#e83a66",
  "Stačilo!": "#cc0033",
  "Motoristé": "#7699de",
  "Spolu": "#1565c0",
  "ANO": "#33cccc",
};

// Mapování stran na jejich loga
const stranyLoga: Record<string, string> = {
  "ANO": "https://d15-a.sdn.cz/d_15/c_img_oa_A/nO7kYQIzllzLYfDe5DlgjGY/b232/ano-logo.png?fl=nop",
  "Piráti+Zelení": "https://d15-a.sdn.cz/d_15/c_img_oa_A/nO7kYQIzllCHfwdDesDlglbC/2474/pirati.png?fl=nop",
  "Motoristé": "https://d15-a.sdn.cz/d_15/c_img_oa_A/kPxAuWMbDHCqtaXBoFDlgj47/943b/motoriste-sobe.png?fl=nop",
  "Přísaha": "https://d15-a.sdn.cz/d_15/c_img_oa_A/kPxAuWMbDHCgJCaBr1Dlg45k/a4de/prisaha.png?fl=nop",
  "SPD": "https://d15-a.sdn.cz/d_15/c_img_oa_A/nO7kYQIzllDshrEDkCDlgmwP/6e8a/spd.png?fl=nop",
  "Spolu": "https://d15-a.sdn.cz/d_15/c_img_oa_A/kPxAuWMbDHBP5fVBqGDlgneB/96db/spolu.png?fl=nop",
  "STAN": "https://d15-a.sdn.cz/d_15/c_img_oa_A/kPxAuWMbDHDRREJBrODlgo7W/4527/starostove.png?fl=nop",
  "Stačilo!": "https://d15-a.sdn.cz/d_15/c_img_oa_A/nO7kYQIzllCHfwdDe2DlgoDC/061c/stacilo.png?fl=nop",
};

// Funkce pro získání loga strany
const getStranaLogo = (strana: string) => {
  return stranyLoga[strana] || '';
};

// Seznam možností odpovědí
const moznostiOdpovedi = [
  { value: 1, label: "Rozhodně souhlasím" },
  { value: 2, label: "Spíše souhlasím" },
  { value: 3, label: "Spíše nesouhlasím" },
  { value: 4, label: "Rozhodně nesouhlasím" }
];

export function VolebniKalkulacka({ otazky, odpovedi = {}, stranyOdpovedi, bodovaMatice, onSubmit }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>(odpovedi);
  const [crucialQuestions, setCrucialQuestions] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [showCrucialQuestionsSelection, setShowCrucialQuestionsSelection] = useState(false);
  const [results, setResults] = useState<Vysledek[]>([]);
  const [openDetail, setOpenDetail] = useState<number | null>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);

  const currentQuestion = otazky?.[currentQuestionIndex];
  
  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = otazky?.length || 0;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  
  const handleAnswer = useCallback((questionId: number, answer: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  const toggleCrucialQuestion = useCallback((questionId: number) => {
    setCrucialQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        if (newSet.size < 5) {
          newSet.add(questionId);
        }
      }
      return newSet;
    });
  }, []);

  const calculateResults = useCallback(() => {
    if (!stranyOdpovedi || !otazky || otazky.length === 0) {
      return;
    }
    
    const results = Object.entries(stranyOdpovedi).map(([strana, odpovediStrany]) => {
      let positivePoints = 0;
      let negativePoints = 0;
      let importantCount = 0;
      let answeredCount = 0;

      otazky.forEach((question, index) => {
        const userAnswer = userAnswers[question.id];
        const partyAnswer = odpovediStrany[index];
        
        if (userAnswer && partyAnswer) {
          answeredCount++;
          const weight = crucialQuestions.has(question.id) ? 2 : 1;
          if (crucialQuestions.has(question.id)) {
            importantCount++;
          }
          
          const points = bodovaMatice[userAnswer][partyAnswer] * weight;
          
          if (points > 0) {
            positivePoints += points;
          } else {
            negativePoints += Math.abs(points);
          }
        }
      });

      if (answeredCount === 0) return { strana, shoda: 50 };

      const maxPoints = (answeredCount * 10) + (importantCount * 10);
      const shoda = ((positivePoints - negativePoints) / (maxPoints * 2) + 0.5) * 100;
      
      return {
        strana,
        shoda: Math.max(0, Math.min(100, Math.round(shoda))),
      };
    });

    setResults(results.sort((a, b) => b.shoda - a.shoda));
    setShowResults(true);
    
    if (onSubmit) {
      onSubmit(userAnswers, Array.from(crucialQuestions));
    }
  }, [stranyOdpovedi, otazky, userAnswers, crucialQuestions, bodovaMatice, onSubmit]);

  // Scrollování na začátek při zobrazení výsledků
  useEffect(() => {
    if (showResults && contentAreaRef.current) {
      setTimeout(() => {
        contentAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [showResults]);

  const handlePrevious = useCallback(() => {
    if (showCrucialQuestionsSelection) {
      setShowCrucialQuestionsSelection(false);
      setCurrentQuestionIndex(totalQuestions - 1);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [showCrucialQuestionsSelection, totalQuestions, currentQuestionIndex]);

  const handleNext = useCallback(() => {
    if (otazky && currentQuestionIndex < otazky.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (!showCrucialQuestionsSelection) {
      setShowCrucialQuestionsSelection(true);
    } else {
      calculateResults();
    }
  }, [otazky, currentQuestionIndex, showCrucialQuestionsSelection, calculateResults]);

  const resetCalculator = useCallback(() => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setCrucialQuestions(new Set());
    setShowResults(false);
    setShowCrucialQuestionsSelection(false);
  }, []);

  const downloadResults = useCallback(() => {
    if (!results.length) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Nepodařilo se vytvořit canvas context');
      return;
    }

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Načtení všech potřebných obrázků
    const loadImages = async () => {
      const imagePromises: Promise<{ key: string; img: HTMLImageElement }>[] = [];
      
      // Načteme loga stran pro výsledky
      results.slice(0, 5).forEach((result) => {
        const logoUrl = stranyLoga[result.strana];
        if (logoUrl) {
          const promise = new Promise<{ key: string; img: HTMLImageElement }>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve({ key: result.strana, img });
            img.onerror = () => reject(new Error(`Nepodařilo se načíst logo pro ${result.strana}`));
            img.src = logoUrl;
          });
          imagePromises.push(promise);
        }
      });
      
      // Načteme NMS logo
      const nmsLogoPromise = new Promise<{ key: string; img: HTMLImageElement }>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve({ key: 'nms', img });
        img.onerror = () => reject(new Error('Nepodařilo se načíst NMS logo'));
        img.src = 'https://d15-a.sdn.cz/d_15/c_img_oa_A/nO7kYQIzllCcIbPDeNDlguXT/13b9/nms.png?fl=nop';
      });
      imagePromises.push(nmsLogoPromise);
      
      // Načteme Novinky logo
      const novinkyLogoPromise = new Promise<{ key: string; img: HTMLImageElement }>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve({ key: 'novinky', img });
        img.onerror = () => reject(new Error('Nepodařilo se načíst Novinky logo'));
        img.src = 'https://d15-a.sdn.cz/d_15/c_img_ob_A/nPTQKDwGerDZzxhButDwDy0B/33c0/logo-novinky.png?fl=nop';
      });
      imagePromises.push(novinkyLogoPromise);
      
      try {
        const loadedImages = await Promise.allSettled(imagePromises);
        const images: Record<string, HTMLImageElement> = {};
        
        loadedImages.forEach((result) => {
          if (result.status === 'fulfilled') {
            images[result.value.key] = result.value.img;
          } else {
            console.warn('Nepodařilo se načíst obrázek:', result.reason);
          }
        });
        
        return images;
      } catch (error) {
        console.error('Chyba při načítání obrázků:', error);
        return {};
      }
    };

    const renderCanvas = (images: Record<string, HTMLImageElement>) => {
      // Definice konstant pro layout
      const numberOfResults = Math.min(results.length, 5); // max 5 stran pro původní rozměry
      const cardHeight = 180;
      const cardMargin = 30;
      
      // Header (bez loga Novinek - jen v patičce)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, 120);
      
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Volební kalkulačka 2025', canvas.width / 2, 50);
      
      ctx.font = '24px Arial';
      ctx.fillText('Vaše výsledky', canvas.width / 2, 85);

      // Date
      ctx.fillStyle = '#666666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'right';
      const date = new Date().toLocaleDateString('cs-CZ');
      ctx.fillText(`Vyplněno: ${date}`, canvas.width - 50, 110);
      
      let yPos = 150;
      const cardWidth = 980;
      const leftMargin = (canvas.width - cardWidth) / 2;

      results.slice(0, numberOfResults).forEach((result, index) => {
        // Karta strany
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        
        // Zaoblené rohy pro kartu
        const radius = 8;
        ctx.beginPath();
        ctx.moveTo(leftMargin + radius, yPos);
        ctx.lineTo(leftMargin + cardWidth - radius, yPos);
        ctx.arcTo(leftMargin + cardWidth, yPos, leftMargin + cardWidth, yPos + radius, radius);
        ctx.lineTo(leftMargin + cardWidth, yPos + cardHeight - radius);
        ctx.arcTo(leftMargin + cardWidth, yPos + cardHeight, leftMargin + cardWidth - radius, yPos + cardHeight, radius);
        ctx.lineTo(leftMargin + radius, yPos + cardHeight);
        ctx.arcTo(leftMargin, yPos + cardHeight, leftMargin, yPos + cardHeight - radius, radius);
        ctx.lineTo(leftMargin, yPos + radius);
        ctx.arcTo(leftMargin, yPos, leftMargin + radius, yPos, radius);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Levý červený okraj pro první místo
        if (index === 0) {
          ctx.fillStyle = '#c8102e';
          ctx.fillRect(leftMargin, yPos, 4, cardHeight);
        }
        
        // Logo strany (stejné jako na webu)
        const logoSize = 80;
        const logoX = leftMargin + 40;
        const logoY = yPos + 20;
        
        if (images[result.strana]) {
          // Bílé pozadí pro logo
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(logoX, logoY, logoSize, logoSize);
          
          // Jemný stín kolem loga
          ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 1;
          ctx.fillRect(logoX, logoY, logoSize, logoSize);
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          
          // Vykreslíme logo s malým paddingem (jako na webu)
          const padding = 8;
          const img = images[result.strana];
          const imgAspect = img.width / img.height;
          const availableSize = logoSize - (padding * 2);
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imgAspect > 1) {
            // Širší obrázek
            drawWidth = availableSize;
            drawHeight = availableSize / imgAspect;
          } else {
            // Vyšší obrázek
            drawHeight = availableSize;
            drawWidth = availableSize * imgAspect;
          }
          
          drawX = logoX + (logoSize - drawWidth) / 2;
          drawY = logoY + (logoSize - drawHeight) / 2;
          
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        } else {
          // Fallback - barevný čtverec s iniciály (stejně jako na webu)
          ctx.fillStyle = stranyBarvy[result.strana] || '#1976d2';
          ctx.fillRect(logoX, logoY, logoSize, logoSize);
          
          // Iniciály strany
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          const initials = result.strana.split(' ').map(word => word[0]).join('').substring(0, 3);
          ctx.fillText(initials, logoX + logoSize/2, logoY + logoSize/2 + 8);
        }

        // Pořadí a název strany (zarovnané s logem)
        ctx.fillStyle = '#1a1a1a';
        ctx.textAlign = 'left';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`${index + 1}. ${result.strana}`, leftMargin + 140, yPos + 45);
        
        // Popis strany (na dva řádky)
        ctx.font = '18px Arial';
        ctx.fillStyle = '#666666';
        const popis = stranyPopis[result.strana] || `${result.strana} je politická strana.`;
        
        // Rozdělíme popis na dva řádky
        const maxWidth = 450; // maximální šířka textu
        const words = popis.split(' ');
        let firstLine = '';
        let secondLine = '';
        
        // Najdeme optimální rozdělení
        for (let i = 0; i < words.length; i++) {
          const testLine = firstLine + (firstLine ? ' ' : '') + words[i];
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width <= maxWidth || firstLine === '') {
            firstLine = testLine;
          } else {
            secondLine = words.slice(i).join(' ');
            break;
          }
        }
        
        // Vykreslíme první řádek
        ctx.fillText(firstLine, leftMargin + 140, yPos + 70);
        
        // Vykreslíme druhý řádek (pokud existuje)
        if (secondLine) {
          ctx.fillText(secondLine, leftMargin + 140, yPos + 95);
        }

        // Progress bar (posunutý níže kvůli dvouřádkovému popisu)
        const progressBarWidth = 500;
        const progressBarHeight = 12;
        const progressBarX = leftMargin + 140;
        const progressBarY = yPos + 125;
        
        // Pozadí progress baru
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
        
        // Vyplněný progress bar
        const filledWidth = (result.shoda / 100) * progressBarWidth;
        if (filledWidth > 0) {
          ctx.fillStyle = stranyBarvy[result.strana] || '#1976d2';
          ctx.fillRect(progressBarX, progressBarY, filledWidth, progressBarHeight);
        }
        
        // Procento shody (zarovnané vpravo)
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${result.shoda}%`, leftMargin + cardWidth - 40, yPos + 65);
        
        ctx.fillStyle = '#999999';
        ctx.font = '16px Arial';
        ctx.fillText('shoda', leftMargin + cardWidth - 40, yPos + 85);
        
        yPos += cardHeight + cardMargin;
      });
      
      // Footer
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
      
      // Vycentrovaný footer
      ctx.fillStyle = '#666666';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      
      // Spočítáme celkovou šířku pro vycentrování
      const textSpacing = 10;
      const logoHeight = 30;
      const novinkyWidth = images.novinky ? (images.novinky.width / images.novinky.height) * logoHeight : 0;
      const nmsWidth = images.nms ? (images.nms.width / images.nms.height) * logoHeight : 0;
      const textWidth = ctx.measureText('ve spolupráci s').width;
      
      const totalWidth = novinkyWidth + textSpacing + textWidth + textSpacing + nmsWidth;
      const startX = (canvas.width - totalWidth) / 2;
      
      // Novinky logo
      if (images.novinky) {
        ctx.drawImage(images.novinky, startX, canvas.height - 55, novinkyWidth, logoHeight);
      }
      
      // Text
      ctx.textAlign = 'left';
      ctx.fillText('ve spolupráci s', startX + novinkyWidth + textSpacing, canvas.height - 35);
      
      // NMS logo
      if (images.nms) {
        ctx.drawImage(images.nms, startX + novinkyWidth + textSpacing + textWidth + textSpacing, canvas.height - 55, nmsWidth, logoHeight);
      }
      
      // Convert to image and download
      const dataUrl = canvas.toDataURL('image/png');
      
      // Detekce, zda jsme v iframe/embedded prostředí
      const isEmbedded = window !== window.parent;
      
      if (isEmbedded) {
        try {
          // Komunikace s rodičovským oknem pro stažení
          window.parent.postMessage({
            type: 'downloadImage',
            dataUrl: dataUrl,
            filename: 'volebni-kalkulacka-vysledky.png'
          }, '*');

          // Zobrazení zpětné vazby uživateli
          const downloadInfo = document.createElement('div');
          downloadInfo.className = 'download-notification';
          downloadInfo.innerHTML = 'Obrázek se připravuje ke stažení...';
          document.body.appendChild(downloadInfo);
          
          // Fallback - pokud se nestáhne za 5 sekund, nabídneme přímé stažení
          setTimeout(() => {
            if (document.body.contains(downloadInfo)) {
              downloadInfo.innerHTML = 'Nepodařilo se stáhnout přes embed. <a href="' + dataUrl + '" download="volebni-kalkulacka-vysledky.png" style="color: #c8102e; text-decoration: underline;">Klikněte zde pro stažení</a>';
              
              // Automatické odstranění po dalších 10 sekundách
              setTimeout(() => {
                if (document.body.contains(downloadInfo)) {
                  document.body.removeChild(downloadInfo);
                }
              }, 10000);
            }
          }, 5000);
        } catch (error) {
          console.error('Chyba při odesílání zprávy rodičovskému oknu:', error);
          // Fallback na přímé stažení
          const link = document.createElement('a');
          link.download = 'volebni-kalkulacka-vysledky.png';
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // Standardní stažení pro non-iframe
        const link = document.createElement('a');
        link.download = 'volebni-kalkulacka-vysledky.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
    
    // Načteme obrázky a pak vykreslíme canvas
    loadImages().then((images) => {
      renderCanvas(images);
    });
  }, [results, stranyLoga, stranyBarvy, stranyPopis, bodovaMatice, userAnswers, crucialQuestions]);

  // Funkce pro přepínání detailu otázky
  const toggleDetail = useCallback((id: number) => {
    setOpenDetail(openDetail === id ? null : id);
  }, [openDetail]);

  if (showResults) {
    return (
      <div className="volebni-kalkulacka">
        <div className="header">
          <h1>Volební kalkulačka 2025</h1>
          <p>Vaše výsledky</p>
        </div>
        
        <div className="content-area" ref={contentAreaRef}>
          <div className="results-container">
            <div id="resultsContainer">
              {results.map((result, index) => (
                <div key={result.strana} className="party-result-card">
                  <div className="party-logo">
                    <img src={getStranaLogo(result.strana)} alt={`Logo ${result.strana}`} />
                  </div>
                  <div className="party-info">
                    <div className="party-header">
                      <span className="party-rank">{index + 1}. {result.strana}</span>
                    </div>
                    <div className="party-description">
                      {stranyPopis[result.strana] || `${result.strana} je politická strana.`}
                    </div>
                    <div className="party-progress">
                      <div 
                        className="party-progress-bar" 
                        style={{ width: `${result.shoda}%`, background: stranyBarvy[result.strana] || '#1976d2' }}
                      ></div>
                    </div>
                  </div>
                  <div className="party-score">
                    <div className="score-number">{result.shoda}%</div>
                    <div className="score-label">shoda</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="results-actions">
          <button className="action-button primary" onClick={downloadResults} data-dot="sc-volebni-kalkulacka-poslanecke-volby-2025/stahnout-vysledky">
            Stáhnout výsledky
          </button>
          <button className="action-button secondary" onClick={resetCalculator} data-dot="sc-volebni-kalkulacka-poslanecke-volby-2025/vyplnit-znovu">
            Vyplnit znovu
          </button>
        </div>
        
        <div className="footer">
          <p>Novinky.cz ve spolupráci s <a href="https://nms.global/cz/" target="_blank" rel="noopener noreferrer"><img src="https://d15-a.sdn.cz/d_15/c_img_oa_A/nO7kYQIzllCcIbPDeNDlguXT/13b9/nms.png?fl=nop" alt="NMS" className="nms-logo" /></a></p>
        </div>
      </div>
    );
  }
  
  if (showCrucialQuestionsSelection) {
    return (
      <div className="volebni-kalkulacka">
        <div className="header">
          <h1>Volební kalkulačka 2025</h1>
          <p>Výběr zásadních otázek</p>
        </div>
        
        <div className="content-area" ref={contentAreaRef}>
          <div className="question-slide">
            <div className="question-text">
              Vyberte až 5 otázek, které jsou pro vás nejdůležitější
            </div>
            
            <div className="crucial-questions-info">
              Tyto otázky budou mít při výpočtu výsledků dvojnásobnou váhu. 
              Vybráno: {crucialQuestions.size} z 5
            </div>
            
            <div className="scroll-indicator">
              <i></i>
            </div>
            
            <div className="crucial-questions-list">
              {otazky.map((otazka, index) => (
                <div 
                  key={otazka.id} 
                  className={`crucial-question-item ${crucialQuestions.has(otazka.id) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    id={`crucial-${otazka.id}`}
                    checked={crucialQuestions.has(otazka.id)}
                    onChange={() => toggleCrucialQuestion(otazka.id)}
                    disabled={!crucialQuestions.has(otazka.id) && crucialQuestions.size >= 5}
                  />
                  <label 
                    htmlFor={`crucial-${otazka.id}`}
                  >
                    <span style={{ fontWeight: crucialQuestions.has(otazka.id) ? 'bold' : 'normal' }}>
                      {otazka.text}
                    </span>
                    <div className="answer-label">
                      Vaše odpověď: {moznostiOdpovedi.find(opt => opt.value === userAnswers[otazka.id])?.label || "Nezodpovězeno"}
                    </div>
                    {otazka.popis && (
                      <>
                        <div 
                          className="detail-button" 
                          onClick={() => toggleDetail(otazka.id)}
                        >
                          Podrobnosti
                          <span className={`arrow ${openDetail === otazka.id ? 'open' : ''}`}>▼</span>
                        </div>
                        <div className={`detail-content ${openDetail === otazka.id ? 'open' : ''}`}>
                          {otazka.popis}
                        </div>
                      </>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="navigation">
          <button 
            className="nav-button back" 
            onClick={handlePrevious}
            data-dot="sc-volebni-kalkulacka-poslanecke-volby-2025/zpet"
          >
            Zpět
          </button>
          <button 
            className="nav-button next" 
            onClick={handleNext}
            data-dot="sc-volebni-kalkulacka-poslanecke-volby-2025/zobrazit-vysledky"
          >
            Zobrazit výsledky
          </button>
        </div>
        
        <div className="footer">
          <p>Novinky.cz ve spolupráci s <a href="https://nms.global/cz/" target="_blank" rel="noopener noreferrer"><img src="https://d15-a.sdn.cz/d_15/c_img_oa_A/nO7kYQIzllCcIbPDeNDlguXT/13b9/nms.png?fl=nop" alt="NMS" className="nms-logo" /></a></p>
        </div>
      </div>
    );
  }

  return (
    <div className="volebni-kalkulacka">
      <div className="header">
        <h1>Volební kalkulačka 2025</h1>
        <p>Porovnejte své názory s politickými stranami</p>
      </div>
      
      <div className="progress-container">
        <div className="progress-info">
          <span>Otázka {currentQuestionIndex + 1} z {totalQuestions}</span>
          <span>Zodpovězeno: {answeredCount} z {totalQuestions}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%`, background: '#c8102e' }}
          ></div>
        </div>
      </div>

      <div className="content-area" ref={contentAreaRef}>
        <div className="question-slide">
          <div className="question-text">
            {currentQuestion?.text}
          </div>
          
          {currentQuestion?.popis && (
            <>
              <div 
                className="detail-button" 
                onClick={() => toggleDetail(currentQuestion.id)}
              >
                Podrobnosti
                <span className={`arrow ${openDetail === currentQuestion.id ? 'open' : ''}`}>▼</span>
              </div>
              <div className={`detail-content ${openDetail === currentQuestion.id ? 'open' : ''}`}>
                {currentQuestion.popis}
              </div>
            </>
          )}
          
          <div className="options-container">
            {moznostiOdpovedi.map(option => (
              <label 
                key={option.value} 
                className={`option-label ${currentQuestion && userAnswers[currentQuestion.id] === option.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion?.id}`}
                  value={option.value}
                  checked={currentQuestion && userAnswers[currentQuestion.id] === option.value}
                  onChange={() => currentQuestion && handleAnswer(currentQuestion.id, option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div className="navigation">
        <button 
          className="nav-button back" 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          data-dot="sc-volebni-kalkulacka-poslanecke-volby-2025/zpet"
        >
          Zpět
        </button>
        <button 
          className="nav-button next" 
          onClick={handleNext}
          disabled={currentQuestion && !userAnswers[currentQuestion.id]}
          data-dot="sc-volebni-kalkulacka-poslanecke-volby-2025/dalsi-otazka"
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Pokračovat' : 'Další'}
        </button>
      </div>
      
      <div className="footer">
        <p>Novinky.cz ve spolupráci s <a href="https://nms.global/cz/" target="_blank" rel="noopener noreferrer"><img src="https://d15-a.sdn.cz/d_15/c_img_oa_A/nO7kYQIzllCcIbPDeNDlguXT/13b9/nms.png?fl=nop" alt="NMS" className="nms-logo" /></a></p>
      </div>
    </div>
  );
} 