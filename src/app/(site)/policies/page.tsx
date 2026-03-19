export default function PoliciesPage() {
  return (
    <div className="section-padding">
      <div className="container-main max-w-5xl">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium uppercase tracking-widest">Policies</span>
          <h1 className="text-3xl md:text-5xl font-serif text-foreground mt-2">Privacy, Terms & Refunds</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-sm">
            This page contains our Privacy Policy, Terms & Conditions, and Refund Policy.
          </p>
        </div>

        <div className="space-y-8">
          <section id="privacy" className="scroll-mt-24 bg-card rounded-xl border border-border p-6 md:p-8">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-4">Privacy Policy</h2>
            <div className="text-muted-foreground text-sm leading-relaxed space-y-4">
              <p>
                We respect your privacy and are committed to protecting the personal information you share with us.
                This Privacy Policy explains what we collect, how we use it, and the choices you have.
              </p>
              <div>
                <h3 className="font-sans font-semibold text-foreground mb-2">Information we collect</h3>
                <p>
                  We may collect information such as your name, email address, phone number, shipping/billing address,
                  and order details when you place an order or contact us.
                </p>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-foreground mb-2">How we use your information</h3>
                <p>
                  We use your information to process orders, provide customer support, improve our services,
                  and communicate important updates related to your purchases.
                </p>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-foreground mb-2">Payments</h3>
                <p>
                  Payments are processed through secure payment gateways. We do not store your full card details on our servers.
                </p>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-foreground mb-2">Cookies</h3>
                <p>
                  We may use cookies and similar technologies to enhance your browsing experience and understand site usage.
                  You can manage cookies through your browser settings.
                </p>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-foreground mb-2">Contact</h3>
                <p>
                  If you have questions about this policy, contact us at <span className="text-foreground">info@naturo.com</span>.
                </p>
              </div>
            </div>
          </section>

          <section id="terms" className="scroll-mt-24 bg-card rounded-xl border border-border p-6 md:p-8">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-4">Terms & Conditions</h2>
            <div className="text-muted-foreground text-sm leading-relaxed space-y-4">
              <p>
                By accessing and using our website, you agree to comply with these Terms & Conditions.
                Please read them carefully before placing an order.
              </p>
              <div>
                <h3 className="font-sans font-semibold text-foreground mb-2">Orders</h3>
                <p>
                  All orders are subject to availability and confirmation of the order price. We reserve the right to refuse
                  or cancel any order in case of suspected fraud or incorrect pricing.
                </p>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-foreground mb-2">Shipping</h3>
                <p>
                  Delivery timelines are estimates and may vary based on location and courier operations.
                  We are not responsible for delays caused by events outside our control.
                </p>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-foreground mb-2">Product information</h3>
                <p>
                  We aim to display product information accurately. However, minor variations in packaging or appearance
                  may occur.
                </p>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-foreground mb-2">Limitation of liability</h3>
                <p>
                  To the maximum extent permitted by law, Naturo will not be liable for any indirect or consequential damages
                  arising from use of this website or products.
                </p>
              </div>
            </div>
          </section>

          <section id="refund" className="scroll-mt-24 bg-card rounded-xl border border-border p-6 md:p-8">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-4">Refund Policy</h2>
            <div className="text-muted-foreground text-sm leading-relaxed space-y-4">
              <p>
                We strive to ensure you are satisfied with your purchase. If you face an issue, please contact our support
                team as soon as possible.
              </p>
              <div>
                <h3 className="font-sans font-semibold text-foreground mb-2">Eligibility</h3>
                <p>
                  Refunds may be considered in cases such as damaged products, missing items, or incorrect products delivered.
                  Requests should be raised within a reasonable time after delivery.
                </p>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-foreground mb-2">Process</h3>
                <p>
                  To request a refund, contact us with your order details and supporting images (if applicable).
                  After review, we will confirm the approval or rejection of your request.
                </p>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-foreground mb-2">Refund timeline</h3>
                <p>
                  If approved, refunds are processed back to the original payment method. Processing time may vary depending
                  on your bank/payment provider.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
