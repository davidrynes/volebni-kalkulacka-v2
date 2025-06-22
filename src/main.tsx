import { render } from 'preact'
import './app.css'
import { App } from './app.tsx'

const rootElement = document.getElementById('app')
if (rootElement) {
  // Nastavíme rozměry pro desktop
  if (window.innerWidth > 480) {
    rootElement.style.width = '600px'
    rootElement.style.height = 'auto'
    rootElement.style.minHeight = '700px'
  } else {
    // Pro mobilní zařízení necháme responzivní
    rootElement.style.width = '100%'
    rootElement.style.height = 'auto'
    rootElement.style.minHeight = '100vh'
  }
  
  rootElement.style.display = 'flex'
  rootElement.style.justifyContent = 'center'
  rootElement.style.alignItems = 'center'
  rootElement.style.overflow = 'visible'
  rootElement.style.margin = '0 auto'
  rootElement.style.position = 'relative'
}

// Vykreslení aplikace
render(<App />, document.getElementById('app')!)

// Funkce pro resizing iframe
function resizeParentIframeIfNeeded() {
  try {
    // Kontrola, zda je aplikace v iframe
    if (window !== window.parent) {
      const message = {
        type: 'resize',
        width: window.innerWidth > 480 ? 600 : window.innerWidth,
        height: window.innerWidth > 480 ? 700 : window.innerHeight
      }
      window.parent.postMessage(message, '*')
    }
  } catch (e) {
    console.error('Chyba při pokusu o komunikaci s rodičovským oknem:', e)
  }
}

// Vynucené překreslení po načtení
window.addEventListener('load', () => {
  resizeParentIframeIfNeeded()
})

// Přizpůsobení při změně velikosti okna
window.addEventListener('resize', () => {
  const rootElement = document.getElementById('app')
  if (rootElement) {
    if (window.innerWidth > 480) {
      rootElement.style.width = '600px'
      rootElement.style.height = 'auto'
      rootElement.style.minHeight = '700px'
    } else {
      rootElement.style.width = '100%'
      rootElement.style.height = 'auto'
      rootElement.style.minHeight = '100vh'
    }
  }
  resizeParentIframeIfNeeded()
})
