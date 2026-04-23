
import "./styles/globals.scss";
import Header from "./components/layout/Header";
import localFont from "next/font/local";
import Footer from "./components/layout/Footer";
import NoHoverTouch from "./components/ui/NoHoverTouch";
import { Providers } from "./context/Providers";
import { FavoriteProvider } from "./context/FavoriteContext";
import { RateProvider } from "./context/RateContext";


const dancingFont = localFont({
  src: "./fonts/DancingScript-VariableFont_wght.ttf",
  variable: "--font-dancing",
  weight: "400",
});
const loraFont = localFont({
  src: "./fonts/Lora-VariableFont_wght.ttf",
  variable: "--font-lora", // CSS változó név
  display: "swap", // Optional, for better performance
});


export const metadata = {
  title: "Kóstolj Bele! - Receptgyüjtemény!",
  description: "Receptgyűjtő alkalmazás",
  keywords: ['Next.js', 'React', 'JavaScript'],
  authors: [{ name: 'Thomas Horvath' }],
  icons: {
    icon: "/favicon.svg"
  },
};

export default async function RootLayout({ children }) {
  return (
    <html lang="hu" className={`${loraFont.variable} ${dancingFont.variable}`}>
      <body className="main">
        {/* Desktop iranyban mar nem klasszikus weboldalkent gondolkodunk.
            Emiatt a shell egyszerubb, alkalmazasszerubb szerkezetet kap. */}
          <Providers>
            <FavoriteProvider>
              <NoHoverTouch />
              <div className="app-shell">
                <Header />
                {/* A main tartalom rugalmasan kitolti a Header es Footer kozotti
                    helyet. Igy rovid oldalakon, peldaul loginon, a Footer nem
                    csuszik fel a tartalom ala, hanem az ablak legaljan marad. */}
                <main className="app-content">
                  <RateProvider>
                    {children}
                  </RateProvider>
                </main>
                <Footer />
              </div>
            </FavoriteProvider>
          </Providers>
      </body>
    </html>
  );
}
