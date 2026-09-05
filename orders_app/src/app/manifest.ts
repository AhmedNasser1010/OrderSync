import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OrderSync Orders",
    short_name: "Orders",
    description:
      "Restaurant Order Management - Accept, prepare, and track orders in real time",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563EB",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192-v2.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512-v2.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-192-v2.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512-v2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: "Orders",
        short_name: "Orders",
        url: "/en/main",
        icons: [{ src: "/icons/icon-192-v2.png", sizes: "192x192" }],
      },
      {
        name: "Settings",
        short_name: "Settings",
        url: "/en/main/settings",
        icons: [{ src: "/icons/icon-192-v2.png", sizes: "192x192" }],
      },
    ],
  };
}
