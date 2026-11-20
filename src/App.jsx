import { useEffect, useState } from 'react';

const legacyStyleUrl = '/legacy/style.css?v=4.0.0-responsive';
const supabaseUrl = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
const legacyThemeUrl = '/legacy/theme-stickers.js?v=4.0.0-responsive';
const legacyScriptUrl = '/legacy/app.js?v=4.0.0-responsive';
const fontStyleUrls = [
  'https://fonts.googleapis.com/css2?family=Jua&family=Nunito:wght@400;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
];

function loadScript(src) {
  return new Promise((resolve) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = resolve;
    document.head.appendChild(script);
  });
}

/**
 * React migration entry point.
 *
 * The existing markup is mounted directly in the browser page—not in an
 * iframe—so its responsive breakpoints continue to use the real viewport.
 * Replace this compatibility view feature-by-feature with React components.
 */
export default function App() {
  const [legacyMarkup, setLegacyMarkup] = useState('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    document.title = '스티커판';

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = legacyStyleUrl;
    document.head.appendChild(stylesheet);

    // The former standalone page loaded these from its <head>. Its body is
    // now rendered by React, so load them here to preserve every UI icon.
    const fontStylesheets = fontStyleUrls.map((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
      return link;
    });

    fetch('/legacy/index.html')
      .then((response) => {
        if (!response.ok) throw new Error('Legacy markup could not be loaded.');
        return response.text();
      })
      .then((html) => {
        const legacyDocument = new DOMParser().parseFromString(html, 'text/html');
        legacyDocument.querySelectorAll('script').forEach((script) => script.remove());
        setLegacyMarkup(legacyDocument.body.innerHTML);
      })
      .catch(() => setLoadError(true));

    return () => {
      stylesheet.remove();
      fontStylesheets.forEach((link) => link.remove());
    };
  }, []);

  useEffect(() => {
    if (!legacyMarkup || window.__moonLegacyAppLoaded) return;

    window.__moonLegacyAppLoaded = true;
    loadScript(supabaseUrl)
      .then(() => loadScript(legacyThemeUrl))
      .then(() => loadScript(legacyScriptUrl));
  }, [legacyMarkup]);

  return (
    <>
      {!legacyMarkup && !loadError && (
        <div className="migration-loading" role="status" aria-live="polite">
          스티커판을 불러오는 중이에요…
        </div>
      )}
      {loadError && (
        <div className="migration-loading" role="alert">
          스티커판을 불러오지 못했어요. 새로고침 후 다시 시도해 주세요.
        </div>
      )}
      {legacyMarkup && (
        <div
          className="legacy-root"
          dangerouslySetInnerHTML={{ __html: legacyMarkup }}
        />
      )}
    </>
  );
}
