import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Navbar } from '../components/Navbar';
import Head from 'next/head';

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/icon.ico" />
        <title>RESTORIX</title>
      </Head>
      <div className="app">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <div className="app-container">
            <Component {...pageProps} />
          </div>
        </div>
      </div>
    </>
  );
}

App.getInitialProps = async (appContext: any) => {
  return {};
};

export default App;
