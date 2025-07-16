import { NextResponse } from "next/server";
import * as fs from 'fs';
import * as path from 'path';

// Zjistíme, zda běžíme v produkčním prostředí (Vercel)
const isProd = process.env.NODE_ENV === 'production' && process.env.VERCEL === '1';

// Adresář pro ukládání dat (v produkčním prostředí by bylo lepší použít DB)
const DATA_DIR = path.join(process.cwd(), 'data');

// Zajistí, že adresář pro data existuje - pouze v lokálním prostředí
if (!isProd && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export async function POST(request: Request) {
  try {
    // Získat data z požadavku
    const data = await request.json();

    // Validace dat (základní)
    if (!data.odpovedi || !data.vysledky) {
      return NextResponse.json({ error: 'Neplatná data' }, { status: 400 });
    }

    // Přidání časové značky pro jedinečné ID
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const id = `odpoved_${timestamp}`;
    
    // Anonymizace - smazání všech potenciálně osobních údajů
    const anonymizedData = {
      id,
      timestamp: data.timestamp,
      odpovedi: data.odpovedi,
      zasadniOtazky: data.zasadniOtazky,
      vysledky: data.vysledky
    };

    // V produkčním prostředí (Vercel) pouze logujeme data
    if (isProd) {
    } else {
      // V lokálním prostředí ukládáme do souboru
      const filePath = path.join(DATA_DIR, `${id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(anonymizedData, null, 2));
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Chyba při ukládání odpovědí:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování požadavku' },
      { status: 500 }
    );
  }
} 