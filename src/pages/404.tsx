import React from 'react';
import Layout from '@theme/Layout';

export default function NotFound() {
  return (
    <Layout title="Page Not Found">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
          textAlign: 'center',
          padding: '2rem',
        }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
          Looks like you've ventured off the path.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a className="button button--primary button--lg" href="/">
            Return to Proposal
          </a>
          <a className="button button--secondary button--lg" href="/pitch">
            View Pitch Deck
          </a>
        </div>
      </div>
    </Layout>
  );
}
