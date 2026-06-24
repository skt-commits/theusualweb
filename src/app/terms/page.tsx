export default function TermsPage() {
  return (
    <main style={{ paddingBottom: '4rem' }}>
      <div className="page-header">
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Terms of Service</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.2rem' }}>Rules and guidelines for using our platform.</p>
        </div>
      </div>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <p style={{ color: 'var(--foreground)', marginBottom: '2rem' }}>Last Updated: June 24, 2026</p>
          
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>1. Agreement to Terms</h2>
          <p style={{ marginBottom: '1.5rem' }}>By accessing our website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>

          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>2. Use License</h2>
          <p style={{ marginBottom: '1.5rem' }}>Permission is granted to temporarily download one copy of the materials (information or software) on The Usuals's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>

          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>3. Disclaimer</h2>
          <p>The materials on The Usuals's website are provided on an 'as is' basis. The Usuals makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
        </div>
      </div>
    </main>
  );
}
