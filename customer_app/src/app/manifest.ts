import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "زاجل | Zajel",
    short_name: "زاجل",
    description:
      "اطلب أكل لذيذ أونلاين من مطاعمك المحلية المفضلة مع زاجل. توصيل أكل سريع وموثوق لحد بابك.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#9333EA",
    orientation: "portrait-primary",
    categories: ["food", "shopping"],
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
        name: "المطاعم",
        short_name: "Restaurants",
        url: "/",
        icons: [{ src: "/icons/icon-192-v2.png", sizes: "192x192" }],
      },
      {
        name: "سلة المشتريات",
        short_name: "Cart",
        url: "/cart",
        icons: [{ src: "/icons/icon-192-v2.png", sizes: "192x192" }],
      },
    ],
  };
}
