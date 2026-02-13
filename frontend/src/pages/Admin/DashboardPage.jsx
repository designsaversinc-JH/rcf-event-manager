import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../../api/admin';

const DashboardPage = () => {
  const [data, setData] = useState(null);

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
    <section>
      <h2>Dashboard</h2>
      <div className="stat-grid">
        <article><h3>{data.totalBlogs}</h3><p>Total Blogs</p></article>
        <article><h3>{data.openJobs}</h3><p>Open Jobs</p></article>
        <article><h3>{data.totalCategories}</h3><p>Categories</p></article>
        <article><h3>{data.totalTags}</h3><p>Tags</p></article>
      </div>

      <h3>Quick Buttons</h3>
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
