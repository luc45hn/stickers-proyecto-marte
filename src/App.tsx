import { useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { CafeteriasPage } from './pages/CafeteriasPage';
import { RecorridoPage } from './pages/RecorridoPage';
import './index.css';

type Page = 'cafeterias' | 'recorrido';

export default function App() {
  const [page, setPage] = useState<Page>('cafeterias');

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

  return (
    <APIProvider apiKey={apiKey}>
      <div id="app">
        <header className="app-header">
          <img src="/proyectoMarteLogo.jpg" alt="Proyecto Marte" className="header-logo" />
          <div className="header-text">
            <span className="header-title">Stickers</span>
            <span className="header-subtitle">Proyecto Marte</span>
          </div>
        </header>

        <main className="main-content">
          {page === 'cafeterias' && <CafeteriasPage />}
          {page === 'recorrido' && <RecorridoPage />}
        </main>

        <nav className="bottom-nav">
          <button
            className={page === 'cafeterias' ? 'active' : ''}
            onClick={() => setPage('cafeterias')}
          >
            <span className="nav-icon">☕</span>
            Cafeterías
          </button>
          <button
            className={page === 'recorrido' ? 'active' : ''}
            onClick={() => setPage('recorrido')}
          >
            <span className="nav-icon">🗺️</span>
            Recorrido
          </button>
        </nav>
      </div>
    </APIProvider>
  );
}
