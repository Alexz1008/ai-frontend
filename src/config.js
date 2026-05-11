let config = {};

export async function loadConfig() {
  try {
    const response = await fetch('/config.json');
    config = await response.json();
  } catch {
    console.warn('Failed to load /config.json, falling back to build-time env vars');
  }
}

export function getConfig(key) {
  return config[key] || import.meta.env[`VITE_${key}`] || '';
}
