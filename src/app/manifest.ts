import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "hanziway (漢字道)",
    short_name: "hanziway",
    description: "Chinese character dictionary and input method practice.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c0a09",
    theme_color: "#fb2c36",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
