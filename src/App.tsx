import { useState } from 'react';
import { ToastProvider } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ClientProvider } from '@/components/ClientProvider';
import { DataProvider } from '@/components/DataProvider';
import { Sidebar, type ViewId } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { OverviewView } from '@/views/OverviewView';
import { KeywordsView } from '@/views/KeywordsView';
import { MapsView } from '@/views/MapsView';
import { CompetitorsView } from '@/views/CompetitorsView';
import { GscView } from '@/views/GscView';
import { ReportsView } from '@/views/ReportsView';
import { AlertsView } from '@/views/AlertsView';
import { SettingsView } from '@/views/SettingsView';
import { CitationsView } from '@/views/CitationsView';
import { LandingPage } from '@/views/LandingPage';

function App() {
  const [route, setRoute] = useState<'landing' | 'dashboard'>('landing');
  const [view, setView] = useState<ViewId>('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (route === 'landing') {
    return (
      <ThemeProvider>
        <ToastProvider>
          <LandingPage onLaunch={(target?: ViewId) => { if (target) setView(target); setRoute('dashboard'); }} />
        </ToastProvider>
      </ThemeProvider>
    );
  }

  const render = () => {
    switch (view) {
      case 'overview': return <OverviewView onGoKeywords={() => setView('keywords')} />;
      case 'keywords': return <KeywordsView />;
      case 'maps': return <MapsView />;
      case 'competitors': return <CompetitorsView />;
      case 'gsc': return <GscView />;
      case 'reports': return <ReportsView />;
      case 'alerts': return <AlertsView />;
      case 'citations': return <CitationsView />;
      case 'settings': return <SettingsView />;
    }
  };

  return (
    <ThemeProvider>
    <ToastProvider>
    <ClientProvider>
      <DataProvider>
        <div className="flex min-h-screen bg-ink-950 relative">
          <div className="fixed inset-0 bg-grid-fade pointer-events-none" />
          <Sidebar
            view={view}
            onNavigate={setView}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            onBackToLanding={() => setRoute('landing')}
          />
          <div className="flex-1 min-w-0 flex flex-col relative">
            <Header onMenu={() => setMobileOpen(true)} onBellNavigate={() => setView('alerts')} />
            <main className="flex-1 p-4 lg:p-7 max-w-[1400px] w-full mx-auto">
              {render()}
            </main>
          </div>
        </div>
      </DataProvider>
    </ClientProvider>
    </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
