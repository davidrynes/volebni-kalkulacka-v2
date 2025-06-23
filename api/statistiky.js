// Vercel Serverless Function pro zobrazení statistik

// Import dat z endpointu pro ukládání odpovědí
// Poznámka: V reálném prostředí by data byla uložena v databázi
import { ulozenaData } from './ulozit-odpovedi';

/**
 * Funkce zpracovávající HTTP požadavek
 */
export default async function handler(req, res) {
  // Nastavení CORS hlaviček
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://www.novinky.cz');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Zpracování OPTIONS požadavku (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Kontrola metody
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metoda není podporována' });
  }

  try {
    // V reálném prostředí by zde byl kód pro získání dat z databáze
    // Pro účely demonstrace použijeme simulovaná data
    
    // Pokud nemáme přístup k datům z ulozit-odpovedi.js, použijeme prázdné pole
    const data = typeof ulozenaData !== 'undefined' ? ulozenaData : [];
    
    // Výpočet statistik
    const deviceStats = data.reduce((acc, item) => {
      acc[item.zarizeni] = (acc[item.zarizeni] || 0) + 1;
      return acc;
    }, {});
    
    const regionStats = data.reduce((acc, item) => {
      if (item.kraj) {
        acc[item.kraj] = (acc[item.kraj] || 0) + 1;
      }
      return acc;
    }, {});
    
    const stats = {
      totalRecords: data.length,
      deviceStats,
      regionStats
    };
    
    return res.status(200).json({ 
      success: true,
      stats
    });
  } catch (error) {
    console.error('Chyba při zpracování požadavku:', error);
    
    return res.status(500).json({ 
      error: 'Nepodařilo se zpracovat požadavek',
      details: error.message || 'Unknown error' 
    });
  }
} 