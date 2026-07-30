export default function PrivacyPage() {
  return (
    <div className="section-padding">
      <div className="container-max max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: July 2026</p>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            ASTRAX-VOID respects your privacy. We collect only the data necessary to operate the
            marketplace: account details, order history, payment references (never full card data),
            and support communications.
          </p>
          <p>
            Payment processing is handled by Paystack, Flutterwave and Stripe. We do not store
            full payment card numbers.
          </p>
          <p>
            We use cookies and local storage for cart, session and preference purposes. You can
            clear them at any time.
          </p>
          <p>
            For data deletion requests, contact support via Discord or the Contact page.
          </p>
        </div>
      </div>
    </div>
  );
}
