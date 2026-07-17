import { createFileRoute } from "@tanstack/react-router";
import { OSProvider } from "@/components/webos/OSContext";
import { Desktop } from "@/components/webos/Desktop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Infinity OS — Web Desktop Simulator" },
      {
        name: "description",
        content:
          "A gorgeous glassmorphic Web OS simulator with a draggable window manager, dock, file explorer, terminal, settings, and theme switcher.",
      },
      { property: "og:title", content: "Infinity OS — Web Desktop Simulator" },
      {
        property: "og:description",
        content: "A premium glassmorphic desktop environment running in your browser.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <OSProvider>
      <Desktop />
    </OSProvider>
  );
}
