import React, { useEffect, useState } from 'react';
import { fetchHelpContent } from '../../api/admin';
import usePageMeta from '../../hooks/usePageMeta';

const HelpPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  usePageMeta({
    title: 'Help Center | Roseland Ceasefire',
    description: 'Documentation, quick start steps, and FAQs for admin users.',
    canonicalUrl: '/admin/help',
    noIndex: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchHelpContent();
        setData(response.data || null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="page-loading">Loading help center...</div>;
  }

  if (!data) {
    return <div className="page-loading">Help content unavailable.</div>;
  }

  return (
    <section className="help-page">
      <div className="help-header">
        <h2>{data.title || 'Help Center'}</h2>
        <p>{data.intro || ''}</p>
      </div>

      <article className="help-card">
        <h3>Quick Start</h3>
        <ol>
          {(data.quickStart || []).map((item, index) => (
            <li key={`step-${index + 1}`}>{item}</li>
          ))}
        </ol>
      </article>

      <article className="help-card">
        <h3>FAQ</h3>
        <div className="help-faq-list">
          {(data.faq || []).map((item) => (
            <details key={item.id} className="help-faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </article>
    </section>
  );
};

export default HelpPage;
