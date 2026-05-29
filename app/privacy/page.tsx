export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-10">Last updated: May 29, 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Overview</h2>
          <p>
            Multick is a time tracking tool for developers. This policy covers both the
            web application at multick.dev and the Multick Chrome extension.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Data we collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">Account information:</strong> name, email
              address, and profile picture provided through Google sign-in.
            </li>
            <li>
              <strong className="text-foreground">Time entries:</strong> project names, start
              and stop times, and source labels (manual or AI-assisted) that you create.
            </li>
            <li>
              <strong className="text-foreground">API key (Chrome extension only):</strong> stored
              locally on your device using Chrome&apos;s storage API. It is never sent to any
              server other than multick.dev.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Data we do NOT collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Browsing history or visited URLs</li>
            <li>Website content, keystrokes, or mouse activity</li>
            <li>Location data</li>
            <li>Financial or payment information (payments are handled by Stripe)</li>
            <li>Personal communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Chrome extension</h2>
          <p>
            The Multick Chrome extension communicates exclusively with multick.dev to
            start timers, stop timers, and fetch your project list. It requires the
            following permissions:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <strong className="text-foreground">storage:</strong> to save your API key
              locally on your device.
            </li>
            <li>
              <strong className="text-foreground">host permission (multick.dev):</strong> to
              communicate with the Multick API.
            </li>
          </ul>
          <p className="mt-2">
            The extension does not read or modify any web page content, does not run in
            the background, and does not collect any browsing data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Third-party sharing</h2>
          <p>
            We do not sell, rent, or share your personal data with third parties. Data is
            only processed by infrastructure providers (hosting, database) necessary to
            operate the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Data retention</h2>
          <p>
            Your data is retained as long as your account is active. You can delete your
            account and all associated data at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Contact</h2>
          <p>
            If you have questions about this privacy policy, contact us at{" "}
            <a
              href="mailto:pablobullor@gmail.com"
              className="text-foreground underline underline-offset-4 hover:text-primary"
            >
              pablobullor@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
