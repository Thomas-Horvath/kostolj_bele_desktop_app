import { getDesktopApi } from "./getDesktopApi";

const profileClient = {
  get() {
    return getDesktopApi().profile.get();
  },
  createUser(payload) {
    return getDesktopApi().profile.createUser(payload);
  },
};

export default profileClient;

