// API endpoint pro ukládání odpovědí uživatelů
// Toto je základní implementace, která může být upravena dle potřeby

interface OdpovediUzivatele {
  [id: number]: number;
}

interface RequestData {
  odpovedi: OdpovediUzivatele;
  zasadniOtazky: number[];
  zarizeni: string;
  kraj?: string;
  timestamp: number;
}

// Úložiště pro data - v produkčním prostředí by bylo nahrazeno databází
let ulozenaData: Array<{
  id: number;
  odpovedi: OdpovediUzivatele;
  zasadniOtazky: number[];
  zarizeni: string;
  kraj?: string;
  timestamp: number;
  ulozeno: string;
  ip: string;
}> = [];

let ulozenychZaznamu = 0;

// Anonymizace IP adresy - zachová pouze první dvě části
const anonymizeIp = (ip: string): string => {
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
export async function handleRequest(request: Request): Promise<Response> {
  // Kontrola metody
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Metoda není podporována' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST'
      }
    });
  }

  try {
    // Parsování těla požadavku
    const data: RequestData = await request.json();
    
    // Validace dat
    if (!data.odpovedi || !data.zarizeni) {
      return new Response(JSON.stringify({ error: 'Chybějící povinná data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Získání IP adresy z hlaviček (v reálném prostředí by to bylo jinak řešeno)
    const forwarded = request.headers.get('x-forwarded-for');
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
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Data byla úspěšně uložena',
      id: zaznam.id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Nepodařilo se zpracovat požadavek',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Funkce pro získání statistik (mohla by být použita v administraci)
export function getStats() {
  const deviceStats = ulozenaData.reduce((acc, item) => {
    acc[item.zarizeni] = (acc[item.zarizeni] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const regionStats = ulozenaData.reduce((acc, item) => {
    if (item.kraj) {
      acc[item.kraj] = (acc[item.kraj] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalRecords: ulozenaData.length,
    deviceStats,
    regionStats
  };
}

// Exportujeme handler pro různé prostředí
export default handleRequest; 