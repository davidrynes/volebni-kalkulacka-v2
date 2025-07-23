/// <reference types="vite/client" />

// Novinky.cz specifické funkce pro iframe prostředí
declare global {
  interface Window {
    $redirectToUrl?: (url: string) => void;
    $redirectAllLinks?: () => void;
  }
}
