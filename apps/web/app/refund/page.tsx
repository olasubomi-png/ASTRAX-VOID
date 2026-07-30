export default function RefundPage() {
  return (
    <div className="section-padding">
      <div className="container-max max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-6">Refund Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: July 2026</p>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Because our products are digital and delivered automatically, refunds are limited.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-white">Non-delivery:</strong> If a product fails to deliver
              after successful payment, contact support within 24 hours for a full refund or
              re-delivery.
            </li>
            <li>
              <strong className="text-white">Critical defects:</strong> Documented critical issues
              that make the product unusable may qualify for partial or full refund at our
              discretion.
            </li>
            <li>
              <strong className="text-white">Change of mind:</strong> Not eligible for refund once
              the download link or license key has been issued.
            </li>
          </ul>
          <p>
            Open a support ticket or message us on Discord with your order ID for the fastest
            resolution.
          </p>
        </div>
      </div>
    </div>
  );
}
