/**
 * Example usage of I18n Provider
 * 
 * This file demonstrates how to use the i18n context provider in a component.
 * You can copy this pattern to use translations in any client component.
 */

'use client';

import { I18nProvider, useTranslations } from './index';

/**
 * Example component that uses translations
 */
function ExampleComponent() {
  const { t, locale, changeLanguage } = useTranslations();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.description')}</p>
      
      <nav>
        <ul>
          <li>{t('nav.dashboard')}</li>
          <li>{t('nav.users')}</li>
          <li>{t('nav.sessions')}</li>
          <li>{t('nav.xray_management')}
            <ul>
              <li>{t('nav.xray.inbounds')}</li>
              <li>{t('nav.xray.clients')}</li>
              <li>{t('nav.xray.nodes')}</li>
              <li>{t('nav.xray.routing')}</li>
            </ul>
          </li>
        </ul>
      </nav>

      <div>
        <p>Current locale: {locale}</p>
        <button onClick={() => changeLanguage('en')}>English</button>
        <button onClick={() => changeLanguage('ru')}>Русский</button>
      </div>
    </div>
  );
}

/**
 * App wrapper with I18nProvider
 */
export default function ExampleApp() {
  return (
    <I18nProvider>
      <ExampleComponent />
    </I18nProvider>
  );
}
