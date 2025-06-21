# Volební kalkulačka 2025

Interaktivní volební kalkulačka pro porovnání názorů uživatelů s politickými stranami.

## Funkce

- Odpovídání na otázky o politických tématech
- Výběr zásadních otázek s dvojnásobnou váhou
- Automatická detekce zařízení a regionu uživatele
- Výpočet shody s politickými stranami
- Vizualizace výsledků s logy stran
- Možnost stáhnout výsledky jako obrázek
- Sběr anonymizovaných dat pro statistiky

## Technologie

- Preact/React
- TypeScript
- Tailwind CSS
- Vite
- Vercel Serverless Functions

## Lokální vývoj

1. Naklonujte repozitář
2. Nainstalujte závislosti:
   ```
   npm install
   ```
3. Spusťte vývojový server:
   ```
   npm run dev
   ```

## Nasazení na Vercel

Projekt je připraven pro nasazení na platformě Vercel. Pro nasazení postupujte následovně:

1. Vytvořte účet na [Vercel](https://vercel.com) (pokud ho ještě nemáte)
2. Nainstalujte Vercel CLI:
   ```
   npm install -g vercel
   ```
3. Přihlaste se k Vercelu:
   ```
   vercel login
   ```
4. Nasaďte projekt:
   ```
   vercel
   ```
5. Pro produkční nasazení:
   ```
   vercel --prod
   ```

## Struktura projektu

- `src/` - Zdrojový kód aplikace
  - `components/` - React komponenty
  - `services/` - Služby pro práci s daty
  - `api/` - API endpointy (pro vývojové prostředí)
- `api/` - Vercel Serverless Functions
- `public/` - Statické soubory (loga stran, obrázky)
- `loga/` - Loga politických stran

## Rozšíření a úpravy

Pro produkční nasazení doporučujeme:

1. Implementovat skutečnou databázi (např. MongoDB, Firebase)
2. Vylepšit detekci regionu pomocí serverového řešení
3. Přidat autentizaci pro přístup ke statistikám

## Licence

Tento projekt je licencován pod [MIT licencí](LICENSE). 