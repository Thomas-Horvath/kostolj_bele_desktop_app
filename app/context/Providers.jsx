"use client";

import { DesktopAuthProvider } from "./DesktopAuthContext";
import { FavoriteProvider } from "./FavoriteContext";

export function Providers({ children }) {
  // Ez mar nem webes SessionProvider, hanem a sajat desktop auth reteg.
  // Innen kapja meg az egesz app az aktualis usert es a login/logout muveleteket.
  //
  // A favorit syncet itt direkt az auth ala rakjuk:
  // a FavoriteProvidernek tudnia kell, hogy epp melyik userhez tartoznak a kedvencek,
  // de a kedvencek valtozasa mar ne mozgassa meg az auth reteg mukodeset.
  return (
    <DesktopAuthProvider>
      <FavoriteProvider>{children}</FavoriteProvider>
    </DesktopAuthProvider>
  );
}
