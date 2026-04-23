import { getDesktopApi } from "./getDesktopApi";

// A renderer oldali auth wrapper kesobb az uj DesktopAuthContext alapja lesz.
// Itt mar most egyseges API-t adunk, hogy a komponenseknek ne kelljen tudniuk
// semmit az IPC channel-nevekrol.
const authClient = {
  login(credentials) {
    return getDesktopApi().auth.login(credentials);
  },
  logout() {
    return getDesktopApi().auth.logout();
  },
  getCurrentUser() {
    return getDesktopApi().auth.getCurrentUser();
  },
};

export default authClient;

