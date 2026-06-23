const LAST_UPDATED = "June 23, 2026";
const CONTACT_EMAIL = "phantanhoancuong@gmail.com";

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-2 p-6 text-justify">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Privacy</h1>
        <p className="text-foreground/40 text-xs">
          Last updated {LAST_UPDATED}
        </p>

        <p className="text-foreground/60 text-sm">
          hanziway is currently a static, client-side app. You don't need to
          create an account and there is no backend server to store or process
          your data. A future version may store more on your device maybe to
          support a practice-history or preferences feature but I intend to keep
          hanziway backend-free; that storage would stay local to your device
          and never reach a server.
        </p>
      </div>

      <div className="flex flex-col gap-6 pt-6">
        <div className="border-foreground/10 flex flex-col gap-2 rounded-sm border-2 p-4">
          <h3 className="text-foreground/40 text-base font-semibold tracking-wider uppercase">
            What hanziway stores
          </h3>
          <p className="text-sm">
            hanziway runs as a Progressive Web App (PWA) with an offline service
            worker. The service worker caches static app assets such as the
            app&apos;s pages and dictionary data on your device, so hanziway
            loads quickly and continues to work without a network connection.
          </p>
          <p className="text-foreground/60 text-sm">
            Nothing you type, select, or practice is sent to or saved by me.
            Your current session lives only in the page&apos;s memory and is
            cleared the moment you reload or close the tab.
          </p>
        </div>

        <div className="border-foreground/10 flex flex-col gap-2 rounded-sm border-2 p-4">
          <h3 className="text-foreground/40 text-base font-semibold tracking-wider uppercase">
            Analytics &amp; third parties
          </h3>
          <p className="text-sm">
            hanziway is hosted on Vercel, which collects basic, aggregated visit
            analytics (such as page view counts) at the infrastructure level.
            This data is not tied to any individual identity and is not used by
            hanziway itself.
          </p>
          <p className="text-foreground/60 text-sm">
            hanziway does not add any analytics, tracking scripts, or error
            reporting of its own, and does not share data with any other third
            party. Vercel, as host, is the only third party involved.
          </p>
        </div>

        <div className="border-foreground/10 flex flex-col gap-2 rounded-sm border-2 p-4">
          <h3 className="text-foreground/40 text-base font-semibold tracking-wider uppercase">
            Contact
          </h3>
          <p className="text-sm">
            If you have any question to ask or bug to report, feel free to
            contact me at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-accent underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
