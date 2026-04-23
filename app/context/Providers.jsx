"use client";

import { DesktopAuthProvider } from "./DesktopAuthContext";

export function Providers({ children }) {
  // Ez mar nem webes SessionProvider, hanem a sajat desktop auth reteg.
  // Innen kapja meg az egesz app az aktualis usert es a login/logout muveleteket.
  return <DesktopAuthProvider>{children}</DesktopAuthProvider>;
}
