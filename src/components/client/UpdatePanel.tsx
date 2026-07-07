"use client";

import { useEffect, useState } from "react";

export default function UpdatePanel() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;

      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;

        installing.addEventListener("statechange", () => {
          if (
            installing.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setWaitingWorker(installing);
          }
        });
      });
    });
  }, []);

  const handleRefresh = () => {
    if (!waitingWorker) return;

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => window.location.reload(),
      { once: true }
    );

    waitingWorker.postMessage("SKIP_WAITING");
  };

  if (!waitingWorker || dismissed) return null;

  return (
    <div className="bg-background/90 absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 p-6 text-center backdrop-blur-sm">
      <h2 className="text-foreground text-lg font-semibold">
        A new version is available
      </h2>
      <p className="text-foreground/60 max-w-sm text-sm">
        Refresh to get the latest version of hanziway, including new features
        and fixes.
      </p>
      <div className="flex gap-3">
        <button
          className="text-foreground/40 hover:text-foreground cursor-pointer rounded-sm px-4 py-2 text-sm transition-colors"
          onClick={() => setDismissed(true)}
        >
          Later
        </button>
        <button
          className="bg-accent text-background cursor-pointer rounded-sm px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
          onClick={handleRefresh}
        >
          Refresh now
        </button>
      </div>
    </div>
  );
}
