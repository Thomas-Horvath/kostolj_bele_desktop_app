import { getDesktopApi } from "./getDesktopApi";

const imageClient = {
  selectFile() {
    return getDesktopApi().images.selectFile();
  },
  getUrl(imageName) {
    return getDesktopApi().images.getUrl(imageName);
  },
};

export default imageClient;

