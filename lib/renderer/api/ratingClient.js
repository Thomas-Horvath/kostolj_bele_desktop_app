import { getDesktopApi } from "./getDesktopApi";

const ratingClient = {
  save(payload) {
    return getDesktopApi().rating.save(payload);
  },
};

export default ratingClient;

