export default function ReturnsPage() {
  return (
    <main style={{ paddingBottom: '4rem' }}>
      <div className="page-header">
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Returns & Exchanges</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.2rem' }}>Everything you need to know about our return policy.</p>
        </div>
      </div>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Our 30-Day Policy</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We want you to love what you ordered. If you're not completely satisfied with your purchase, we will gladly accept returns or exchanges of unwashed, unworn, or defective merchandise with original tags attached within 30 days of the delivery date.
          </p>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', marginTop: '2rem' }}>How to Return</h3>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li>Ensure the item is in its original condition.</li>
            <li>Pack the item securely in its original packaging.</li>
            <li>Include the original invoice or order confirmation.</li>
            <li>Contact our support team to schedule a pickup or drop it at a partnered courier facility.</li>
          </ul>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', marginTop: '2rem' }}>Exchanges</h3>
          <p>If you need a different size or color, the fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.</p>
        </div>
      </div>
    </main>
  );
}
