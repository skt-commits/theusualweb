export default function TermsOfService() {
  return (
    <main className="container" style={{ paddingTop: '140px', paddingBottom: '4rem', maxWidth: '800px' }}>
      <h1 className="text-gradient" style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '2rem' }}>Terms of Service</h1>
      
      <div className="glass-panel" style={{ padding: 'clamp(1.2rem, 4vw, 2rem)', lineHeight: '1.6', color: 'var(--foreground)' }}>
        <p><strong>OVERVIEW</strong></p>
        <p>This website is operated by The Usuals. Throughout the site, the terms "we", "us" and "our" refer to The Usuals. The Usuals offers this website, including all information, tools and Services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.</p>
        
        <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1a1a2e' }}>General Conditions</h2>
        <p>We reserve the right to refuse Service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices.</p>

        <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1a1a2e' }}>Products and Delivery</h2>
        <ul>
          <li>The product bought will be delivered on or before the given timeline.</li>
          <li>We have a 7-day return policy (15 days for certain products).</li>
          <li>Used products or products without tags will not be returned.</li>
          <li>Innerwear, socks, stockings or personal care products will not be returned.</li>
        </ul>

        <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1a1a2e' }}>Modifications to the Service and Prices</h2>
        <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.</p>

        <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1a1a2e' }}>Governing Law</h2>
        <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India.</p>

        <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1a1a2e' }}>Contact Information</h2>
        <p>Questions about the Terms of Service should be sent to us at <strong>theusualsalem@gmail.com</strong>.</p>
      </div>
    </main>
  );
}
