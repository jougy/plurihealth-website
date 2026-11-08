/**
 * traffic-attribution.ts
 * 
 * Preserva e propaga parâmetros de tráfego (UTMs, fbclid, gclid, etc.)
 * entre a Landing Page (plurihealth.com.br) e o SaaS (app.plurihealth.com.br).
 */

const TRACKING_PARAMS = [
  "fbclid",
  "gclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ref",
  "r",
] as const;

const COOKIE_DOMAIN = ".plurihealth.com.br";
const STORAGE_KEY = "pluri_traffic_params";

function getTopLevelDomain(): string {
  if (typeof window === "undefined") return "";
  const hostname = window.location.hostname;
  if (hostname.endsWith("plurihealth.com.br")) {
    return COOKIE_DOMAIN;
  }
  return "";
}

function setSharedCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const domainPart = getTopLevelDomain() ? `; domain=${getTopLevelDomain()}` : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/${domainPart}; SameSite=Lax; Secure`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Extrai parâmetros de rastreamento da URL atual ou do armazenamento local/cookies
 */
export function collectTrackingParams(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const currentUrlParams = new URLSearchParams(window.location.search);
  const collected: Record<string, string> = {};

  let hasNewTracking = false;
  TRACKING_PARAMS.forEach((param) => {
    const val = currentUrlParams.get(param);
    if (val) {
      collected[param] = val;
      hasNewTracking = true;
    }
  });

  if (hasNewTracking) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collected));
      setSharedCookie(STORAGE_KEY, JSON.stringify(collected));
    } catch {
      // Ignora erro de cota ou bloqueio de cookies/storage
    }
    return collected;
  }

  // Tentar restaurar do localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // fallback
  }

  // Tentar restaurar do Cookie
  try {
    const cookieStored = getCookie(STORAGE_KEY);
    if (cookieStored) {
      return JSON.parse(cookieStored);
    }
  } catch {
    // fallback
  }

  return {};
}

/**
 * Anexa parâmetros coletados a um URL de destino
 */
export function decorateUrl(urlStr: string, additionalParams?: Record<string, string>): string {
  try {
    const url = new URL(urlStr, window.location.origin);
    const tracking = collectTrackingParams();

    // 1. Injetar parâmetros de tráfego
    Object.entries(tracking).forEach(([k, v]) => {
      if (!url.searchParams.has(k)) {
        url.searchParams.set(k, v);
      }
    });

    // 2. Injetar parâmetros extras
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([k, v]) => {
        url.searchParams.set(k, v);
      });
    }

    return url.toString();
  } catch {
    return urlStr;
  }
}

/**
 * Configuração e auto-aplicação nos links do SaaS
 */
export function setupTrafficAttribution() {
  if (typeof window === "undefined") return;

  collectTrackingParams();

  // Decorar links para o SaaS app.plurihealth.com.br
  const saasLinks = document.querySelectorAll<HTMLAnchorElement>('a[href*="app.plurihealth.com.br"]');
  saasLinks.forEach((link) => {
    const currentHref = link.getAttribute("href");
    if (currentHref) {
      link.href = decorateUrl(currentHref);
    }
  });
}
