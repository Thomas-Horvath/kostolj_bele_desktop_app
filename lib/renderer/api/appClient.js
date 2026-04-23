import { getDesktopApi } from "./getDesktopApi";

// Az appClient altalanos shell-informaciokat ad vissza.
// Erre kesobb debug panel, health-check vagy desktop-only UI elemek epulhetnek.
const appClient = {
  getRuntimeInfo() {
    return getDesktopApi().app.getRuntimeInfo();
  },
};

export default appClient;

