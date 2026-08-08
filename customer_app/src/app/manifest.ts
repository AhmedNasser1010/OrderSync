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
        src: "/logo.png",
        sizes: "2000x2000",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "2000x2000",
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
        icons: [{ src: "/logo.png", sizes: "2000x2000" }],
      },
      {
        name: "سلة المشتريات",
        short_name: "Cart",
        url: "/cart",
        icons: [{ src: "/logo.png", sizes: "2000x2000" }],
      },
    ],
  };
}
