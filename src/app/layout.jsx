import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import 'locales/i18n';
import BreakpointsProvider from 'providers/BreakpointsProvider';
import LocalizationProvider from 'providers/LocalizationProvider';
import NotistackProvider from 'providers/NotistackProvider';
import SettingsProvider from 'providers/SettingsProvider';
import ThemeProvider from 'providers/ThemeProvider';
import { plusJakartaSans, splineSansMono } from 'theme/typography';
import { createClient } from '@/lib/supabase/server';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import App from './App';

export const metadata = {
  title: 'Aurora',
  description: 'Admin Dashboard and Web App Template',
  icons: [
    {
      rel: 'icon',
      url: `/favicon.ico`,
    },
  ],
};

export default async function RootLayout({ children }) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${plusJakartaSans.className} ${splineSansMono.className}`}
    >
      <body>
        <InitColorSchemeScript attribute="data-aurora-color-scheme" modeStorageKey="aurora-mode" />
        <AppRouterCacheProvider>
          <SupabaseAuthProvider initialSession={session}>
            <SettingsProvider>
              <LocalizationProvider>
                <ThemeProvider>
                  <NotistackProvider>
                    <BreakpointsProvider>
                      <App>{children}</App>
                    </BreakpointsProvider>
                  </NotistackProvider>
                </ThemeProvider>
              </LocalizationProvider>
            </SettingsProvider>
          </SupabaseAuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
