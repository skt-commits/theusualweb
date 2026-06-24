export default function PrivacyPage() {
  return (
    <main style={{ paddingBottom: '4rem' }}>
      <div className="page-header">
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Privacy Policy</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.2rem' }}>How we protect and handle your data.</p>
        </div>
      </div>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <p style={{ color: 'var(--foreground)', marginBottom: '2rem' }}>Last Updated: June 24, 2026</p>
          
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>1. Information We Collect</h2>
          <p style={{ marginBottom: '1.5rem' }}>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for delivery services), delivery notes, and other information you choose to provide.</p>

          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>2. How We Use Information</h2>
          <p style={{ marginBottom: '1.5rem' }}>We may use the information we collect about you to provide, maintain, and improve our services, including, for example, to facilitate payments, send receipts, provide products and services you request (and send related information), develop new features, provide customer support to Users and Drivers, develop safety features, authenticate users, and send product updates and administrative messages.</p>

          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>3. Sharing of Information</h2>
          <p>We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows: with third party service providers who need access to such information to carry out work on our behalf.</p>
        </div>
      </div>
    </main>
  );
}
