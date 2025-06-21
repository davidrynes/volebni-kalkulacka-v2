<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Volební kalkulačka 2025</title>
    <script src="https://unpkg.com/preact@latest/dist/preact.min.js"></script>
    <script src="https://unpkg.com/preact@latest/hooks/dist/hooks.umd.js"></script>
    <script src="https://unpkg.com/htm@latest/dist/htm.umd.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background-color: #f5f5f5;
            color: #1a1a1a;
            line-height: 1.6;
        }

        .kalkulacka-container {
            max-width: 600px;
            margin: 0 auto;
            min-height: 100vh;
            background: white;
            position: relative;
        }

        /* Header */
        .header {
            background: #c8102e;
            color: white;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .header p {
            font-size: 14px;
            opacity: 0.9;
        }

        /* Progress */
        .progress-container {
            padding: 20px;
            background: white;
            border-bottom: 1px solid #e0e0e0;
        }

        .progress-info {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }

        .progress-bar {
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: #c8102e;
            transition: width 0.3s ease;
        }

        /* Question Slide */
        .question-slide {
            padding: 30px 20px;
            min-height: 400px;
            display: flex;
            flex-direction: column;
        }

        .question-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: #c8102e;
            color: white;
            border-radius: 50%;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .question-text {
            font-size: 20px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 30px;
            line-height: 1.4;
        }

        /* Radio Options */
        .options-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 30px;
        }

        .option-label {
            display: flex;
            align-items: center;
            padding: 16px 20px;
            background: #f8f8f8;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 16px;
        }

        .option-label:hover {
            border-color: #c8102e;
            background: #fff5f5;
        }

        .option-label.selected {
            background: #fff5f5;
            border-color: #c8102e;
            font-weight: 600;
        }

        .option-label input[type="radio"] {
            width: 20px;
            height: 20px;
            margin-right: 12px;
            accent-color: #c8102e;
        }

        /* Important Question Checkbox */
        .important-container {
            padding: 16px 20px;
            background: #fef3c7;
            border: 2px solid #fbbf24;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .important-label {
            display: flex;
            align-items: center;
            cursor: pointer;
            font-size: 14px;
            color: #92400e;
        }

        .important-label input[type="checkbox"] {
            width: 18px;
            height: 18px;
            margin-right: 10px;
            accent-color: #f59e0b;
        }

        /* Navigation */
        .navigation {
            display: flex;
            gap: 12px;
            padding: 0 20px 30px;
            justify-content: space-between;
        }

        .nav-button {
            flex: 1;
            padding: 14px 24px;
            font-size: 16px;
            font-weight: 600;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .nav-button.back {
            background: #e0e0e0;
            color: #666;
        }

        .nav-button.back:hover {
            background: #d0d0d0;
        }

        .nav-button.next {
            background: #c8102e;
            color: white;
        }

        .nav-button.next:hover {
            background: #a00824;
        }

        .nav-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Results */
        .results-container {
            padding: 30px 20px;
        }

        .results-header {
            text-align: center;
            margin-bottom: 30px;
        }

        .results-header h2 {
            font-size: 28px;
            color: #1a1a1a;
            margin-bottom: 10px;
        }

        .party-result {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            margin-bottom: 12px;
            background: #f8f8f8;
            border-radius: 8px;
            transition: all 0.2s ease;
        }

        .party-result.top {
            background: #c8102e;
            color: white;
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(200, 16, 46, 0.3);
        }

        .party-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .party-rank {
            font-size: 24px;
            font-weight: bold;
            color: #666;
        }

        .party-result.top .party-rank {
            color: white;
        }

        .party-name {
            font-size: 18px;
            font-weight: 600;
        }

        .party-score {
            text-align: right;
        }

        .score-number {
            font-size: 32px;
            font-weight: bold;
            line-height: 1;
        }

        .score-label {
            font-size: 12px;
            color: #666;
        }

        .party-result.top .score-label {
            color: rgba(255, 255, 255, 0.8);
        }

        /* Action Buttons */
        .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 30px 20px;
        }

        .action-button {
            padding: 14px 24px;
            font-size: 16px;
            font-weight: 600;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
        }

        .action-button.primary {
            background: #c8102e;
            color: white;
        }

        .action-button.secondary {
            background: white;
            color: #c8102e;
            border: 2px solid #c8102e;
        }

        /* Party Answers Table */
        .party-answers {
            padding: 20px;
            background: white;
            margin-top: 20px;
        }

        .party-answers h3 {
            font-size: 20px;
            margin-bottom: 20px;
            color: #1a1a1a;
        }

        .answers-table {
            width: 100%;
            overflow-x: auto;
        }

        .answers-table table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }

        .answers-table th,
        .answers-table td {
            padding: 8px;
            text-align: center;
            border-bottom: 1px solid #e0e0e0;
        }

        .answers-table th {
            background: #f8f8f8;
            font-weight: 600;
            position: sticky;
            top: 0;
        }

        .answer-dot {
            display: inline-block;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            font-weight: bold;
            line-height: 24px;
        }

        .answer-yes-strong { background: #16a34a; color: white; }
        .answer-yes { background: #86efac; color: #14532d; }
        .answer-no { background: #fca5a5; color: #7f1d1d; }
        .answer-no-strong { background: #dc2626; color: white; }

        /* Responsive */
        @media (max-width: 480px) {
            .header h1 {
                font-size: 20px;
            }
            
            .question-text {
                font-size: 18px;
            }
            
            .option-label {
                font-size: 15px;
                padding: 14px 16px;
            }
            
            .party-name {
                font-size: 16px;
            }
            
            .score-number {
                font-size: 28px;
            }
        }

        /* Loading */
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
            font-size: 18px;
            color: #666;
        }

        /* Footer */
        .footer {
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            background: #f8f8f8;
            border-top: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <div id="app"></div>

    <script type="text/javascript">
        const { h, render } = preact;
        const { useState, useEffect } = preactHooks;
        const html = htm.bind(h);

        // Data
        const otazky = [
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

        const bodovaMatice = {
            1: { 1: 10, 2: 7.5, 3: -7.5, 4: -10 },
            2: { 1: 7.5, 2: 10, 3: -5, 4: -7.5 },
            3: { 1: -7.5, 2: -5, 3: 10, 4: 7.5 },
            4: { 1: -10, 2: -7.5, 3: 7.5, 4: 10 }
        };

        const moznostiOdpovedi = [
            { value: 1, label: "Rozhodně ano" },
            { value: 2, label: "Spíše ano" },
            { value: 3, label: "Spíše ne" },
            { value: 4, label: "Rozhodně ne" }
        ];

        // Main Component
        function VolebniKalkulacka() {
            const [currentQuestion, setCurrentQuestion] = useState(0);
            const [odpovedi, setOdpovedi] = useState({});
            const [zasadniOtazky, setZasadniOtazky] = useState(new Set());
            const [showResults, setShowResults] = useState(false);
            const [showPartyAnswers, setShowPartyAnswers] = useState(false);

            const handleAnswer = (questionId, value) => {
                setOdpovedi(prev => ({ ...prev, [questionId]: value }));
            };

            const handleImportant = (questionId) => {
                setZasadniOtazky(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(questionId)) {
                        newSet.delete(questionId);
                    } else {
                        newSet.add(questionId);
                    }
                    return newSet;
                });
            };

            const goToNext = () => {
                if (currentQuestion < otazky.length - 1) {
                    setCurrentQuestion(currentQuestion + 1);
                } else {
                    setShowResults(true);
                }
            };

            const goToPrevious = () => {
                if (currentQuestion > 0) {
                    setCurrentQuestion(currentQuestion - 1);
                }
            };

            const resetCalculator = () => {
                setCurrentQuestion(0);
                setOdpovedi({});
                setZasadniOtazky(new Set());
                setShowResults(false);
                setShowPartyAnswers(false);
            };

            const calculateMatch = (partyAnswers) => {
                let positivePoints = 0;
                let negativePoints = 0;
                let importantCount = 0;
                let answeredCount = 0;

                otazky.forEach((question, index) => {
                    const userAnswer = odpovedi[question.id];
                    const partyAnswer = partyAnswers[index];
                    
                    if (userAnswer) {
                        answeredCount++;
                        const weight = zasadniOtazky.has(question.id) ? 2 : 1;
                        if (zasadniOtazky.has(question.id)) {
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

                if (answeredCount === 0) return 50;

                const maxPoints = (answeredCount * 10) + (importantCount * 10);
                const match = ((positivePoints - negativePoints) / (maxPoints * 2) + 0.5) * 100;
                
                return Math.max(0, Math.min(100, Math.round(match)));
            };

            const results = showResults ? Object.entries(stranyOdpovedi)
                .map(([party, answers]) => ({
                    party,
                    score: calculateMatch(answers)
                }))
                .sort((a, b) => b.score - a.score) : [];

            const answeredCount = Object.keys(odpovedi).length;
            const progress = (answeredCount / otazky.length) * 100;

            const downloadResults = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 800;
                canvas.height = 700;
                const ctx = canvas.getContext('2d');

                // Background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Header
                ctx.fillStyle = '#c8102e';
                ctx.fillRect(0, 0, canvas.width, 100);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 32px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Volební kalkulačka 2025', 400, 45);
                
                ctx.font = '18px Arial';
                ctx.fillText('Moje výsledky', 400, 75);

                // Date
                ctx.fillStyle = '#666666';
                ctx.font = '14px Arial';
                ctx.textAlign = 'right';
                const date = new Date().toLocaleDateString('cs-CZ');
                ctx.fillText(`Vyplněno: ${date}`, 750, 130);

                // Results
                ctx.textAlign = 'left';
                results.slice(0, 10).forEach((result, index) => {
                    const y = 180 + (index * 60);
                    
                    // Background
                    ctx.fillStyle = index === 0 ? '#ffe4e6' : '#f3f4f6';
                    ctx.fillRect(50, y - 25, 700, 50);
                    
                    // Rank
                    ctx.fillStyle = index === 0 ? '#c8102e' : '#666666';
                    ctx.font = 'bold 24px Arial';
                    ctx.fillText(`${index + 1}.`, 70, y);
                    
                    // Party name
                    ctx.fillStyle = '#1a1a1a';
                    ctx.font = '20px Arial';
                    ctx.fillText(result.party, 110, y);
                    
                    // Score
                    ctx.font = 'bold 28px Arial';
                    ctx.textAlign = 'right';
                    ctx.fillStyle = index === 0 ? '#c8102e' : '#666666';
                    ctx.fillText(`${result.score}%`, 650, y);
                    
                    ctx.font = '14px Arial';
                    ctx.fillStyle = '#666666';
                    ctx.fillText('shoda', 700, y);
                    
                    ctx.textAlign = 'left';
                });

                // Footer
                ctx.fillStyle = '#f8f8f8';
                ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
                ctx.fillStyle = '#666666';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('www.novinky.cz | Volební kalkulačka', 400, canvas.height - 15);

                // Download
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `volebni-kalkulacka-${new Date().toISOString().split('T')[0]}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                });
            };

            if (showResults) {
                return html`
                    <div class="kalkulacka-container">
                        <div class="header">
                            <h1>Volební kalkulačka 2025</h1>
                            <p>Vaše výsledky</p>
                        </div>
                        
                        <div class="results-container">
                            <div class="results-header">
                                <h2>Míra shody s politickými stranami</h2>
                                <p>Na základě vašich odpovědí</p>
                            </div>
                            
                            ${results.map((result, index) => html`
                                <div class="party-result ${index === 0 ? 'top' : ''}">
                                    <div class="party-info">
                                        <span class="party-rank">${index + 1}.</span>
                                        <span class="party-name">${result.party}</span>
                                    </div>
                                    <div class="party-score">
                                        <div class="score-number">${result.score}%</div>
                                        <div class="score-label">shoda</div>
                                    </div>
                                </div>
                            `)}
                        </div>
                        
                        <div class="action-buttons">
                            <button class="action-button primary" onclick=${downloadResults}>
                                Stáhnout výsledky
                            </button>
                            <button class="action-button secondary" onclick=${() => setShowPartyAnswers(!showPartyAnswers)}>
                                ${showPartyAnswers ? 'Skrýt' : 'Zobrazit'} odpovědi stran
                            </button>
                            <button class="action-button secondary" onclick=${resetCalculator}>
                                Vyplnit znovu
                            </button>
                        </div>
                        
                        ${showPartyAnswers && html`
                            <div class="party-answers">
                                <h3>Jak odpovídaly politické strany</h3>
                                <div class="answers-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Otázka</th>
                                                ${Object.keys(stranyOdpovedi).map(party => html`
                                                    <th>${party.substring(0, 3)}</th>
                                                `)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${otazky.map((question, qIndex) => html`
                                                <tr>
                                                    <td>${question.id}</td>
                                                    ${Object.entries(stranyOdpovedi).map(([party, answers]) => {
                                                        const answer = answers[qIndex];
                                                        let className = '';
                                                        let symbol = '';
                                                        
                                                        switch(answer) {
                                                            case 1:
                                                                className = 'answer-yes-strong';
                                                                symbol = '++';
                                                                break;
                                                            case 2:
                                                                className = 'answer-yes';
                                                                symbol = '+';
                                                                break;
                                                            case 3:
                                                                className = 'answer-no';
                                                                symbol = '-';
                                                                break;
                                                            case 4:
                                                                className = 'answer-no-strong';
                                                                symbol = '--';
                                                                break;
                                                        }
                                                        
                                                        return html`
                                                            <td>
                                                                <span class="answer-dot ${className}">${symbol}</span>
                                                            </td>
                                                        `;
                                                    })}
                                                </tr>
                                            `)}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        `}
                        
                        <div class="footer">
                            <p>Volební kalkulačka je nezávislá aplikace vytvořená ve spolupráci Novinky.cz a NMS.</p>
                            <p>Výsledky neslouží jako doporučení, koho volit.</p>
                        </div>
                    </div>
                `;
            }

            const currentQ = otazky[currentQuestion];
            const currentAnswer = odpovedi[currentQ.id];
            const isImportant = zasadniOtazky.has(currentQ.id);

            return html`
                <div class="kalkulacka-container">
                    <div class="header">
                        <h1>Volební kalkulačka 2025</h1>
                        <p>Porovnejte své názory s politickými stranami</p>
                    </div>
                    
                    <div class="progress-container">
                        <div class="progress-info">
                            <span>Otázka ${currentQuestion + 1} z ${otazky.length}</span>
                            <span>Zodpovězeno: ${answeredCount}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    
                    <div class="question-slide">
                        <div class="question-number">${currentQ.id}</div>
                        <h2 class="question-text">${currentQ.text}</h2>
                        
                        <div class="options-container">
                            ${moznostiOdpovedi.map(option => html`
                                <label class="option-label ${currentAnswer === option.value ? 'selected' : ''}">
                                    <input 
                                        type="radio" 
                                        name="question-${currentQ.id}"
                                        value=${option.value}
                                        checked=${currentAnswer === option.value}
                                        onchange=${(e) => handleAnswer(currentQ.id, parseInt(e.target.value))}
                                    />
                                    ${option.label}
                                </label>
                            `)}
                        </div>
                        
                        <div class="important-container">
                            <label class="important-label">
                                <input 
                                    type="checkbox"
                                    checked=${isImportant}
                                    onchange=${() => handleImportant(currentQ.id)}
                                />
                                Tato otázka je pro mě zásadní (dvojnásobná váha)
                            </label>
                        </div>
                    </div>
                    
                    <div class="navigation">
                        <button 
                            class="nav-button back" 
                            onclick=${goToPrevious}
                            disabled=${currentQuestion === 0}
                        >
                            Zpět
                        </button>
                        <button 
                            class="nav-button next" 
                            onclick=${goToNext}
                            disabled=${!currentAnswer}
                        >
                            ${currentQuestion === otazky.length - 1 ? 'Zobrazit výsledky' : 'Další'}
                        </button>
                    </div>
                </div>
            `;
        }

        // Render app
        render(html`<${VolebniKalkulacka} />`, document.getElementById('app'));
    </script>
</body>
</html>