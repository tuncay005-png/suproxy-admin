/**
 * Temporary I18n Integration Test Page
 * 
 * This page verifies that i18n context is properly available to all admin pages.
 * Can be accessed at /admin/i18n-test-page to manually verify the integration.
 * 
 * Should be deleted after Task 3.2 is verified.
 */

'use client';

import { useTranslations } from '@/lib/i18n/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function I18nTestPage() {
  const { locale, changeLanguage, t } = useTranslations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">I18n Integration Test</h1>
        <p className="text-muted-foreground">
          This page verifies that i18n context is properly available to admin pages.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Locale</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold mb-4">{locale}</p>
          <div className="flex gap-2">
            <Button onClick={() => changeLanguage('en')} variant={locale === 'en' ? 'default' : 'outline'}>
              English
            </Button>
            <Button onClick={() => changeLanguage('ru')} variant={locale === 'ru' ? 'default' : 'outline'}>
              Русский
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Translation Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-semibold">nav.dashboard:</span> {t('nav.dashboard')}
          </div>
          <div>
            <span className="font-semibold">nav.users:</span> {t('nav.users')}
          </div>
          <div>
            <span className="font-semibold">nav.sessions:</span> {t('nav.sessions')}
          </div>
          <div>
            <span className="font-semibold">nav.xray_management:</span> {t('nav.xray_management')}
          </div>
          <div>
            <span className="font-semibold">nav.xray.inbounds:</span> {t('nav.xray.inbounds')}
          </div>
          <div>
            <span className="font-semibold">dashboard.title:</span> {t('dashboard.title')}
          </div>
          <div>
            <span className="font-semibold">dashboard.xray_status:</span> {t('dashboard.xray_status')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>I18n Context Available ✓</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
