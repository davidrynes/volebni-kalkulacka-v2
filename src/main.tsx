import { render } from 'preact'
import './app.css'
import { App } from './app.tsx'

const rootElement = document.getElementById('app')
if (rootElement) {
  // Nastavíme pevné rozměry
  rootElement.style.width = '600px'
  rootElement.style.height = '700px'
  rootElement.style.display = 'flex'
  rootElement.style.justifyContent = 'center'
  rootElement.style.alignItems = 'center'
  rootElement.style.overflow = 'hidden'
  rootElement.style.margin = '0 auto'
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
        width: 600,
        height: 700
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
  
  const appElement = document.getElementById('app')
  if (appElement) {
    // Vynutíme překreslení
    const currentDisplay = appElement.style.display
    appElement.style.display = 'none'
    setTimeout(() => {
      appElement.style.display = currentDisplay
    }, 10)
  }
})
