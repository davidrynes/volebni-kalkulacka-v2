// API endpoint pro zobrazení statistik sesbíraných dat
import { getStats } from '../ulozit-odpovedi/route';

export async function handleRequest(request: Request): Promise<Response> {
  // Kontrola metody
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Metoda není podporována' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'GET'
      }
    });
  }

  try {
    // Získání statistik
    const stats = getStats();
    
    return new Response(JSON.stringify({ 
      success: true, 
      stats
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Chyba při zpracování požadavku:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Nepodařilo se zpracovat požadavek',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Exportujeme handler pro různé prostředí
export default handleRequest; 