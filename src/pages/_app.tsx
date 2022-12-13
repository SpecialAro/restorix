import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Navbar } from '../components/Navbar';

function App({ Component, pageProps }: AppProps) {
  return (
    <div className="app">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div className="app-container">
          <Component {...pageProps} />
        </div>
      </div>
    </div>
  );
}

App.getInitialProps = async (appContext: any) => {
  return {};
};

export default App;
