# Volební kalkulačka 2025

Interaktivní volební kalkulačka pro porovnání politických preferencí uživatele s postoji hlavních politických stran.

## Funkce

- Interaktivní slide design s 15 politickými otázkami
- Posuvný výběr odpovědí od "Rozhodně ano" po "Rozhodně ne"
- Možnost označit otázky jako zásadní s dvojnásobnou váhou
- Výpočet shody s programy politických stran
- Zobrazení detailního výsledku a možnost stažení jako obrázek
- Anonymní sběr dat pro statistické účely

## Lokální vývoj

```bash
# Instalace závislostí
npm install

# Spuštění vývojového serveru
npm run dev
```

Otevřete [http://localhost:3000](http://localhost:3000) ve vašem prohlížeči.

## Deploy na Vercel

Projekt je připravený pro deployment na Vercel platformu:

1. Propojte repozitář s Vercel
2. Nakonfigurujte environment proměnné podle potřeby
3. Nasaďte pomocí `vercel --prod`

## Anonymní sběr dat

Kalkulačka sbírá anonymní data o odpovědích uživatelů pro statistické účely. Neukládají se žádné osobní údaje ani identifikátory. 