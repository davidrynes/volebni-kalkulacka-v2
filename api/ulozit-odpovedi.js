// Vercel Serverless Function pro ukládání odpovědí uživatelů

// Úložiště pro data - v produkčním prostředí by bylo nahrazeno databází
export let ulozenaData = [];
let ulozenychZaznamu = 0;

// Anonymizace IP adresy - zachová pouze první dvě části
const anonymizeIp = (ip) => {
  if (!ip) return '';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  return ip;
};

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda není podporována' });
  }

  try {
    // Parsování těla požadavku
    const data = req.body;
    
    // Validace dat
    if (!data.odpovedi || !data.zarizeni) {
      return res.status(400).json({ error: 'Chybějící povinná data' });
    }

    // Získání IP adresy z hlaviček
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
    const anonymizedIp = anonymizeIp(ip);
    
    // Přidáme identifikátor záznamu
    ulozenychZaznamu++;
    const zaznam = {
      id: ulozenychZaznamu,
      ...data,
      ulozeno: new Date().toISOString(),
      ip: anonymizedIp
    };

    // Uložení do našeho dočasného úložiště
    ulozenaData.push(zaznam);
    
    // V reálném prostředí bychom zde měli kód pro ukládání do databáze,
    // například pomocí Firebase, MongoDB, nebo jiné databáze
    
    return res.status(200).json({ 
      success: true, 
      message: 'Data byla úspěšně uložena',
      id: zaznam.id 
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Nepodařilo se zpracovat požadavek',
      details: error.message || 'Unknown error' 
    });
  }
} 