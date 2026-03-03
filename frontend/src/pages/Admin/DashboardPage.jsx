import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../../api/admin';
import usePageMeta from '../../hooks/usePageMeta';

const DashboardPage = () => {
  const [data, setData] = useState(null);

  usePageMeta({
    title: 'Admin Dashboard | Roseland Ceasefire',
    description: 'Overview of event publishing metrics, status trends, and activity.',
    canonicalUrl: '/admin/dashboard',
    noIndex: true,
  });

  useEffect(() => {
    const load = async () => {
      const response = await fetchDashboard();
      setData(response.data);
    };

    load();
  }, []);

  if (!data) {
    return <div className="page-loading">Loading dashboard...</div>;
  }

  return (
    <section className="admin-section">
      <h2>Dashboard</h2>
      <p className="section-subtle">Live event publishing health, content mix, and activity snapshots.</p>
      <div className="stat-grid">
        <article><h3>{data.totalBlogs}</h3><p>Total Events</p></article>
        <article><h3>{data.byStatus?.published || 0}</h3><p>Published</p></article>
        <article><h3>{data.byStatus?.pending_review || 0}</h3><p>Pending Review</p></article>
        <article><h3>{data.byType?.video || 0}</h3><p>Video Events</p></article>
        <article><h3>{data.totalCategories}</h3><p>Categories</p></article>
        <article><h3>{data.totalTags}</h3><p>Tags</p></article>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-panel">
          <h3>Status Breakdown</h3>
          <div className="mini-list">
            <span>Draft: {data.byStatus?.draft || 0}</span>
            <span>Waiting Approval: {data.byStatus?.pending_review || 0}</span>
            <span>Posted: {data.byStatus?.published || 0}</span>
            <span>Archived: {data.byStatus?.archived || 0}</span>
          </div>
        </article>
        <article className="dashboard-panel">
          <h3>Publishing Trend</h3>
          <div className="mini-list">
            {(data.trend || []).map((point) => (
              <span key={point.period}>
                {point.period}: {point.count}
              </span>
            ))}
            {!data.trend?.length && <span>No recent activity</span>}
          </div>
        </article>
        <article className="dashboard-panel">
          <h3>Recent Events</h3>
          <div className="mini-list">
            {(data.recentPosts || []).map((post) => (
              <span key={post.id}>{post.title} ({post.status})</span>
            ))}
            {!data.recentPosts?.length && <span>No events yet</span>}
          </div>
        </article>
      </div>

      <h3>Quick Actions</h3>
      <div className="quick-actions">
        {data.quickActions.map((item) => (
          <Link key={item.href} to={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default DashboardPage;
