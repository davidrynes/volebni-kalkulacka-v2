Dohodnutá pravidla pro psaní statického obsahu
Práce s Gitem
Jak a jestli používat branche
větší projekty mohou mít v gitu vytvořenou svojí větev, kam se commitují předprodukční verze. Verze, které se nahrávají do adminu, se mergují do Main
po mergnutí do main smazat branch
iniciály autora na začátek názvu branche (např. js-nazev_projektu)
Pojmenování projektů, organizace složek
pro názvy složek používáme tzv. snake_case
názvy projektů píšeme česky
sdružovat podle názvu, nikoliv do složek
Psaní a kompilace kódu
kód píšeme do separátních souborů index.html, index.css a index.js
live preview výsledné aplikace zobrazíme pomocí příkazu npm run dev (viz soubor README.md)
do adminu se vkládá zkompilovaný kód – o to se stará balící script (příkaz npm run build – viz soubor README.md)
kompilační (balící) script s kódem udělá:
z html odstraní nepotřebné části, které se do statického obsahu nevkládají - tedy definice !DOCTYPE, obsah <head> (meta tagy, vieport apod.) - propíše se jen html obsah uvnitř tagů <main>
odstraní všechny nevyužité CSS třídy (tzn. nejsou použité v index.html ani se negenerují pomocí JS) – vyjímky se dají definovat v souboru CSS purgeignore.css (viz níže)
provede kontrolu kódu, aplikuje polyfills a zkompiluje JS
purgeignore.css
v tomto souboru můžeme definovat CSS třídy, které nejsou adefinované v html ani JS a které by balící script normálně vynechal - hodí se pro případy, kdy v CSS upravujeme třídy z externě načítaného kódu (např api mapy.cz)
v tomto souboru stačí vypsat prázdné CSS třídy bez parametrů, tedy ve fromátu .definice-css {}
u projektů vytvořených před listopadem 2022 je třeba aktualizovat soubor package.json na aktuální verzi ze složky template
Zásady psaní kódu
v kódu píšeme co nejvíc komentáře, aby byl snadno recyklovatelný i pro ostatní členy týmu
formátování (linter)
pro úpravu formátování kódu používáme linter "Prettier" - https://prettier.io
CSS
preferujeme strukturu CSS principem mobile first - tedy nejdřív nastylovat pro mobilní zařízení a pak pomocí media querries upravit vzhled pro desktop
jednotky velikostí píšeme v rem jednotkách (výjimkou jsou prvky typu border nebo hr)
web fonty
nepoužíváme Google Fonts - fonty načítáme z naší CDN
načítáme jen ty řezy, které jsou v daném SC reálně použité
Javascript
exekuce JS kódu až po načtení celého html pomocí event listeneru:
document.addEventListener('DOMContentLoaded', function () {}); 
nebo window.addEventListener('load', () => {});

html
pokud je třeba celý obsah zabalit do jednoho divu, použijeme <div class="content-wrapper">
nepoužíváme h1 - nadpis nejvyšší úrovně je h2
jako default třídu pro základní prvky HTML(h2, p, a apod) použijeme class="content-wrapper" pro který definujeme v CSS globální parametry (barva pozadí, padding, písmo apod)
prvky s proklikem (interaktivní prvky nebo odkazy) mají v CSS parametr cursor: pointer (kurzor ručičky)
všechny odkazy mají v HTML buď target="_top" nebo target="_blank", jinak se na webu odkazovaná stránka otevře uvnitř iframu
Odkazy
html odkazy by měly obsahovat parametr rel="noopener"
pokud dokument obsahuje html odkazy, musí být v index.js volána funkce window.$redirectAllLinks();
pokud se odkazy generují pomocí javascriptu, nestačí použít $redirectAllLinks, musí se použít metody $redirect nebo $redirectToUrl
Měření prokliků pomocí "data-dot"
měříme prokliky uvnitř statického obsahu pomocí HTML parametru data-dot=""
hodnotu data-dot by měl mít i nadřazený prvek, aby se v Reportéru (interní analytický nástroj) daly snadno vyfiltrovat souhrnné statistiky pro celý SC
název data-dotu nadřezeného containeru by měl obsahovat prefix sc- (např. sc-banner-newslettery)
(třeba upřesnit) propagateHits - (true|false) - Zapne přeposílání hitů (všechny kromě action: impress a load) z iframe do hlavní instance DOTu v top okně, kde dojde k jejich duplicitnímu odeslání na server. Defaultně vypnuto. Stačí zapnout v iframe instanci. takze defaultni eventa by mela byt preposlana..
Externí knihovny
snažíme se minimalizovat používání externích knihoven, případně lze nahrát do Seznam CDN a načítat odtud
preferujeme importování knihoven ve formě NPM package pomocí fuckce import
příklady používaných knihoven: Swiper, NoUiSlider, Chart.js
pozn.: Chart.js, ktera od v3 nepodporuje IE11 https://www.chartjs.org/docs/latest/developers/#browser-support .. timpadem se nenacte globalni Chart objekt na ktery tam v kodu spolehame.
Načítání dat JSON
z lokálního souboru
preferovaná varianta oproti dynamicky načítaných dat z API
v NPM lze řešit příkazem const data = require('./data.json');
z externích zdrojů (Google Sheets apod.)
nepoužíváme starou adresu api-web, místo toho používáme api-external
https://api-external.seznamzpravy.cz/proxy/...
https://api-external.seznamzpravy.cz/proxy/google/spreadsheets/{GOOGLE_SHEET_ID}/values/{SHEET_NAME}?key={API_KEY}
Další zásady pro psaní kódu pro SC
změna výšky SC ($resizeStaticContent)
v případě potřeby můžeme zvětšovat výšku iframu (dynamické donačítání nebo dynamická změna velikosti),
není ale doporučeno ji zmenšovat - může se rozbít dynamicky se načítající reklama v sidebaru na desktopu (teoreticky se tedy nevstahuje na mobil)
nema slouzit, ze se nebudou definovat vysky pro jedntolive sirky (tohle je potreba kvuli CLS metrice)
další nástroje pro SC
$setFullscreenMode - prepnuti do fullscreen modu - pokud by byl static content pres celou stranku - aktualne uz se nepouziva
$redirect - melo by se pouzivat vsude, kde mate link element
$redirectToUrl - melo by se pouzivat pokud potrebuje zmenit url adresy hlavni stranky
$redirectAllLinks - staci provolat a namapuje automaticky vsechny link elementy ve static contentu na $redirect metodu
$staticContentConfig - slouzi ke konfiguraci static contentu vypinani defaultu
$Debug - zapnuti debug rezimu
$UrlParams - url parametry
$parentParsedUrl - pomocna promena
$parentUrlParams - parent url parametry
scriptLoader - instance pro nacitani externich scriptu