import { useState, useEffect } from 'preact/hooks';
import { saveUserData, detectRegion } from '../services/dataService';

// Definice typů
interface Otazka {
  id: number;
  text: string;
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
  "Piráti": "Česká pirátská strana je liberální politická strana zaměřená na transparentnost a digitalizaci.",
  "SPD": "SPD je národně konzervativní politická strana vedená Tomiem Okamurou.",
  "Zelení": "Strana zelených je politická strana zaměřená na ekologii a ochranu životního prostředí.",
  "STAN": "Starostové a nezávislí je středopravicová politická strana vycházející z komunální politiky.",
  "Stačilo!": "Stačilo! je levicové politické hnutí vedené Kateřinou Konečnou.",
  "Motoristé": "Motoristé sobě je politické hnutí zaměřené na práva řidičů a dopravní problematiku.",
  "SocDem": "Sociální demokracie je levicová politická strana s důrazem na sociální práva.",
  "Spolu": "SPOLU je koalice stran ODS, KDU-ČSL a TOP 09 s konzervativně-liberální orientací.",
  "ANO": "Hnutí ANO je centristické politické hnutí založené Andrejem Babišem.",
};

// Barvy stran pro progress bar
const stranyBarvy: Record<string, string> = {
  "Přísaha": "#03f",
  "Piráti": "#444444",
  "SPD": "#844e4e",
  "Zelení": "#7fe592",
  "STAN": "#e83a66",
  "Stačilo!": "#cc0033",
  "Motoristé": "#7699de",
  "SocDem": "#ff6600",
  "Spolu": "#1565c0",
  "ANO": "#33cccc",
};

// Mapování stran na jejich loga
const stranyLoga: Record<string, string> = {
  "ANO": "/loga/ano.svg",
  "Piráti": "/loga/pirati.svg",
  "Motoristé": "/loga/motoriste.svg",
  "Přísaha": "/loga/prisaha.png",
  "SPD": "/loga/spd.png",
  "Spolu": "/loga/spolu.png",
  "STAN": "/loga/stan.png",
  "Stačilo!": "/loga/stacilo.png",
  "SocDem": "/loga/socdem.png",
  "Zelení": "/loga/zeleni.png"
};

// Funkce pro získání loga strany
const getStranaLogo = (strana: string) => {
  return stranyLoga[strana] || `https://via.placeholder.com/80x80?text=${encodeURIComponent(strana.substring(0, 3))}`;
};

// Seznam možností odpovědí
const moznostiOdpovedi = [
  { value: 1, label: "Rozhodně ano" },
  { value: 2, label: "Spíše ano" },
  { value: 3, label: "Spíše ne" },
  { value: 4, label: "Rozhodně ne" }
];

export function VolebniKalkulacka({ otazky, odpovedi = {}, stranyOdpovedi, bodovaMatice, onSubmit }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>(odpovedi);
  const [crucialQuestions, setCrucialQuestions] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [showCrucialQuestionsSelection, setShowCrucialQuestionsSelection] = useState(false);
  const [detectedRegion, setDetectedRegion] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<Vysledek[]>([]);

  // Detekce kraje při načtení komponenty
  useEffect(() => {
    detectRegion()
      .then(region => {
        setDetectedRegion(region);
      })
      .catch(error => {
        // Tiché zpracování chyby
      });
  }, []);

  const currentQuestion = otazky?.[currentQuestionIndex];
  
  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = otazky?.length || 0;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  
  const handleAnswer = (questionId: number, answer: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const toggleCrucialQuestion = (questionId: number) => {
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
  };

  const calculateResults = () => {
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
    
    // Uložení dat uživatele na pozadí bez zobrazování stavu
    saveUserData(userAnswers, Array.from(crucialQuestions), detectedRegion)
      .catch(error => {
        // Tiché zpracování chyby
      });
    
    if (onSubmit) {
      onSubmit(userAnswers, Array.from(crucialQuestions));
    }
  };

  const handlePrevious = () => {
    if (showCrucialQuestionsSelection) {
      setShowCrucialQuestionsSelection(false);
      setCurrentQuestionIndex(totalQuestions - 1);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (otazky && currentQuestionIndex < otazky.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (!showCrucialQuestionsSelection) {
      setShowCrucialQuestionsSelection(true);
    } else {
      calculateResults();
    }
  };

  const resetCalculator = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setCrucialQuestions(new Set());
    setShowResults(false);
    setShowCrucialQuestionsSelection(false);
  };

  const downloadResults = () => {
    if (!results.length) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, 100);
    
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
    ctx.fillText(`Vyplněno: ${date}`, canvas.width - 50, 120);

    // Načtení log stran
    const logoPromises = results.slice(0, 5).map((result) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const logoPath = getStranaLogo(result.strana);
        img.src = logoPath.startsWith('http') ? logoPath : window.location.origin + logoPath;
        img.onload = () => resolve(img);
        img.onerror = () => {
          const fallbackImg = new Image();
          fallbackImg.width = 80;
          fallbackImg.height = 80;
          resolve(fallbackImg);
        };
      });
    });

    // Načtení loga Novinky.cz
    const novinyLogoPromise = new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = window.location.origin + '/loga/novinky_logo_rgb.svg';
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.error('Nepodařilo se načíst logo Novinky.cz');
        const fallbackImg = new Image();
        fallbackImg.width = 200;
        fallbackImg.height = 40;
        resolve(fallbackImg);
      };
    });

    Promise.all([...logoPromises, novinyLogoPromise]).then((logoImages) => {
      const partyLogos = logoImages.slice(0, 5);
      const novinyLogo = logoImages[5];
      
      let yPos = 150;
      const cardMargin = 30;
      const cardHeight = 180;
      const cardWidth = 980;
      const leftMargin = (canvas.width - cardWidth) / 2;

      results.slice(0, 5).forEach((result, index) => {
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
        
        // Logo strany - zachování poměru stran
        const logo = partyLogos[index];
        const logoSize = 100;
        const logoX = leftMargin + 30;
        const logoY = yPos + (cardHeight - logoSize) / 2;
        
        if (logo.width && logo.height) {
          // Výpočet rozměrů pro zachování poměru stran
          let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
          
          if (logo.width > logo.height) {
            drawWidth = logoSize;
            drawHeight = (logo.height / logo.width) * logoSize;
            offsetY = (logoSize - drawHeight) / 2;
          } else {
            drawHeight = logoSize;
            drawWidth = (logo.width / logo.height) * logoSize;
            offsetX = (logoSize - drawWidth) / 2;
          }
          
          ctx.drawImage(logo, logoX + offsetX, logoY + offsetY, drawWidth, drawHeight);
        }

        // Pořadí a název strany
        ctx.fillStyle = '#1a1a1a';
        ctx.textAlign = 'left';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`${index + 1}. ${result.strana}`, leftMargin + 160, yPos + 40);
        
        // Popis strany
        ctx.font = '18px Arial';
        ctx.fillStyle = '#666666';
        const popis = stranyPopis[result.strana] || `${result.strana} je politická strana.`;
        ctx.fillText(popis, leftMargin + 160, yPos + 75);

        // Progress bar
        const progressBarWidth = 600;
        const progressBarHeight = 12;
        const progressBarX = leftMargin + 160;
        const progressBarY = yPos + 120;
        
        // Pozadí progress baru - zaoblené rohy
        ctx.fillStyle = '#f0f0f0';
        const progressRadius = 5;
        ctx.beginPath();
        ctx.moveTo(progressBarX + progressRadius, progressBarY);
        ctx.lineTo(progressBarX + progressBarWidth - progressRadius, progressBarY);
        ctx.arcTo(progressBarX + progressBarWidth, progressBarY, progressBarX + progressBarWidth, progressBarY + progressRadius, progressRadius);
        ctx.lineTo(progressBarX + progressBarWidth, progressBarY + progressBarHeight - progressRadius);
        ctx.arcTo(progressBarX + progressBarWidth, progressBarY + progressBarHeight, progressBarX + progressBarWidth - progressRadius, progressBarY + progressBarHeight, progressRadius);
        ctx.lineTo(progressBarX + progressRadius, progressBarY + progressBarHeight);
        ctx.arcTo(progressBarX, progressBarY + progressBarHeight, progressBarX, progressBarY + progressBarHeight - progressRadius, progressRadius);
        ctx.lineTo(progressBarX, progressBarY + progressRadius);
        ctx.arcTo(progressBarX, progressBarY, progressBarX + progressRadius, progressBarY, progressRadius);
        ctx.closePath();
        ctx.fill();
        
        // Vyplněný progress bar - zaoblené rohy
        const filledWidth = (result.shoda / 100) * progressBarWidth;
        if (filledWidth > 0) {
          ctx.fillStyle = stranyBarvy[result.strana] || '#1976d2';
          ctx.beginPath();
          
          // Pro velmi krátké pruhy, které by byly kratší než poloměr, upravit vykreslování
          if (filledWidth < progressRadius * 2) {
            const adjustedRadius = filledWidth / 2;
            ctx.moveTo(progressBarX + adjustedRadius, progressBarY);
            ctx.arcTo(progressBarX + filledWidth, progressBarY, progressBarX + filledWidth, progressBarY + progressRadius, adjustedRadius);
            ctx.lineTo(progressBarX + filledWidth, progressBarY + progressBarHeight - adjustedRadius);
            ctx.arcTo(progressBarX + filledWidth, progressBarY + progressBarHeight, progressBarX + adjustedRadius, progressBarY + progressBarHeight, adjustedRadius);
            ctx.lineTo(progressBarX + adjustedRadius, progressBarY + progressBarHeight);
            ctx.arcTo(progressBarX, progressBarY + progressBarHeight, progressBarX, progressBarY + progressBarHeight - adjustedRadius, adjustedRadius);
            ctx.lineTo(progressBarX, progressBarY + adjustedRadius);
            ctx.arcTo(progressBarX, progressBarY, progressBarX + adjustedRadius, progressBarY, adjustedRadius);
          } else {
            ctx.moveTo(progressBarX + progressRadius, progressBarY);
            ctx.lineTo(progressBarX + filledWidth - progressRadius, progressBarY);
            ctx.arcTo(progressBarX + filledWidth, progressBarY, progressBarX + filledWidth, progressBarY + progressRadius, progressRadius);
            ctx.lineTo(progressBarX + filledWidth, progressBarY + progressBarHeight - progressRadius);
            ctx.arcTo(progressBarX + filledWidth, progressBarY + progressBarHeight, progressBarX + filledWidth - progressRadius, progressBarY + progressBarHeight, progressRadius);
            ctx.lineTo(progressBarX + progressRadius, progressBarY + progressBarHeight);
            ctx.arcTo(progressBarX, progressBarY + progressBarHeight, progressBarX, progressBarY + progressBarHeight - progressRadius, progressRadius);
            ctx.lineTo(progressBarX, progressBarY + progressRadius);
            ctx.arcTo(progressBarX, progressBarY, progressBarX + progressRadius, progressBarY, progressRadius);
          }
          
          ctx.closePath();
          ctx.fill();
        }
        
        // Procento shody
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${result.shoda}%`, leftMargin + cardWidth - 30, yPos + 60);
        
        ctx.fillStyle = '#999999';
        ctx.font = '16px Arial';
        ctx.fillText('shoda', leftMargin + cardWidth - 30, yPos + 85);
        
        yPos += cardHeight + cardMargin;
      });
      
      // Logo Novinky.cz nad patičkou
      if (novinyLogo.width && novinyLogo.height) {
        const logoWidth = 200;
        const logoHeight = (novinyLogo.height / novinyLogo.width) * logoWidth;
        const logoX = (canvas.width - logoWidth) / 2;
        
        // Vypočítáme pozici loga, aby bylo uprostřed volného prostoru
        // Zjistíme, kde končí poslední karta a kde začíná patička
        const lastCardBottom = yPos - cardMargin; // yPos již obsahuje pozici pro další kartu, odečteme margin
        const footerTop = canvas.height - 50; // Patička má výšku 50px
        const availableSpace = footerTop - lastCardBottom;
        const logoY = lastCardBottom + (availableSpace - logoHeight) / 2;
        
        ctx.drawImage(novinyLogo, logoX, logoY, logoWidth, logoHeight);
      }
      
      // Footer
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
      
      ctx.fillStyle = '#666666';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Novinky.cz ve spolupráci s NMS Market Research', canvas.width / 2, canvas.height - 20);

      // Convert to image and download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'volebni-kalkulacka-vysledky.png';
      link.href = dataUrl;
      link.click();
    });
  };

  if (showResults) {
    return (
      <div className="volebni-kalkulacka">
        <div className="header">
          <h1>Volební kalkulačka 2025</h1>
          <p>Vaše výsledky</p>
        </div>
        
        <div className="content-area">
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
          <button className="action-button primary" onClick={downloadResults}>
            Stáhnout výsledky
          </button>
          <button className="action-button secondary" onClick={resetCalculator}>
            Vyplnit znovu
          </button>
        </div>
        
        <div className="footer">
          <p>Novinky.cz ve spolupráci s NMS Market Research</p>
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
        
        <div className="content-area">
          <div className="question-slide">
            <div className="question-text">
              Vyberte až 5 otázek, které jsou pro vás nejdůležitější
            </div>
            
            <div className="crucial-questions-info">
              Tyto otázky budou mít při výpočtu výsledků dvojnásobnou váhu. 
              Vybráno: {crucialQuestions.size} z 5
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
          >
            Zpět
          </button>
          <button 
            className="nav-button next" 
            onClick={handleNext}
          >
            Zobrazit výsledky
          </button>
        </div>
        
        <div className="footer">
          <p>Novinky.cz ve spolupráci s NMS Market Research</p>
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

      <div className="content-area">
        <div className="question-slide">
          <div className="question-text">{currentQuestion?.text}</div>
          
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
        >
          Zpět
        </button>
        <button 
          className="nav-button next" 
          onClick={handleNext}
          disabled={currentQuestion && !userAnswers[currentQuestion.id]}
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Pokračovat' : 'Další'}
        </button>
      </div>
      
      <div className="footer">
        <p>Novinky.cz ve spolupráci s NMS Market Research</p>
      </div>
    </div>
  );
} 