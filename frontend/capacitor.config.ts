import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.popnickel.app",
  appName: "PopNickel",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    CameraPreview: {
      position: "rear",
    },
  },
};

export default config;
