"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import authClient from "../../lib/renderer/api/authClient";

const DesktopAuthContext = createContext(null);

function getStatusFromUser(user) {
  return user?.id ? "authenticated" : "unauthenticated";
}

export function DesktopAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  const [runtimeError, setRuntimeError] = useState("");

  async function refreshAuthState() {
    setRuntimeError("");

    try {
      // App indulaskor innen toltjuk vissza a gepen eltett utolso usert.
      // Ettol lesz "desktopos" a viselkedes: nincs cookie/session redirect,
      // hanem a helyi auth allapot azonnal visszaolvashato.
      const result = await authClient.getCurrentUser();
      const nextUser = result?.user ?? null;

      setUser(nextUser);
      setStatus(getStatusFromUser(nextUser));
      return result;
    } catch (error) {
      // Ha a renderer nem Electron preloadbol fut, azt is egy helyen kezeljuk le.
      // Ilyenkor a UI nem omlik ossze, hanem ertelmes hibaallapotot kap.
      setUser(null);
      setStatus("unauthenticated");
      setRuntimeError(
        error instanceof Error
          ? error.message
          : "Nem sikerült beolvasni a desktop auth állapotot."
      );
      return {
        ok: false,
        user: null,
        isAuthenticated: false,
      };
    }
  }

  useEffect(() => {
    refreshAuthState();
  }, []);

  async function login(credentials) {
    setRuntimeError("");
    try {
      const result = await authClient.login(credentials);

      if (result?.ok) {
        setUser(result.user ?? null);
        setStatus(getStatusFromUser(result.user));
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }

      return result;
    } catch (error) {
      setUser(null);
      setStatus("unauthenticated");
      setRuntimeError(
        error instanceof Error
          ? error.message
          : "Nem sikerült végrehajtani a desktop bejelentkezést."
      );
      return {
        ok: false,
        message: "Nem sikerült végrehajtani a desktop bejelentkezést.",
      };
    }
  }

  async function logout() {
    setRuntimeError("");

    try {
      await authClient.logout();
      setUser(null);
      setStatus("unauthenticated");
    } catch (error) {
      setRuntimeError(
        error instanceof Error
          ? error.message
          : "Nem sikerült végrehajtani a kijelentkezést."
      );
    }
  }

  const value = useMemo(
    () => ({
      user,
      status,
      runtimeError,
      isAuthenticated: Boolean(user?.id),
      login,
      logout,
      refreshAuthState,
    }),
    [runtimeError, status, user]
  );

  return (
    <DesktopAuthContext.Provider value={value}>
      {children}
    </DesktopAuthContext.Provider>
  );
}

export function useDesktopAuth() {
  const context = useContext(DesktopAuthContext);

  if (!context) {
    throw new Error(
      "A useDesktopAuth csak DesktopAuthProvider alatt használható."
    );
  }

  return context;
}
