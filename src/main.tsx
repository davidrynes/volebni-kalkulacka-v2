import { render } from 'preact'
import './app.css'
import { App } from './app.tsx'

const rootElement = document.getElementById('app')
if (rootElement) {
  // Nastavíme rozměry pro desktop
  if (window.innerWidth > 480) {
    rootElement.style.width = '600px'
    rootElement.style.height = '100%'
  } else {
    // Pro mobilní zařízení necháme responzivní
    rootElement.style.width = '100%'
    rootElement.style.height = '100%'
  }
  
  rootElement.style.display = 'flex'
  rootElement.style.flexDirection = 'column'
  rootElement.style.overflow = 'hidden'
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
        height: window.innerHeight
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
    } else {
      rootElement.style.width = '100%'
    }
    rootElement.style.height = '100%'
  }
  resizeParentIframeIfNeeded()
})
