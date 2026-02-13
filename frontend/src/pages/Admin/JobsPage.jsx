import React, { useEffect, useState } from 'react';
import { createJob, deleteJob, fetchJobs, updateJob } from '../../api/admin';

const emptyJob = {
  title: '',
  department: '',
  location: '',
  summary: '',
  applyUrl: '',
  status: 'open',
  publishDate: '',
};

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyJob);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const response = await fetchJobs();
    setJobs(response.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(emptyJob);
    setEditingId(null);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      publishDate: form.publishDate ? new Date(form.publishDate).toISOString() : null,
    };

    if (editingId) {
      await updateJob(editingId, payload);
    } else {
      await createJob(payload);
    }

    reset();
    await load();
  };

  const onEdit = (job) => {
    setEditingId(job.id);
    setForm({
      title: job.title || '',
      department: job.department || '',
      location: job.location || '',
      summary: job.summary || '',
      applyUrl: job.apply_url || '',
      status: job.status || 'open',
      publishDate: job.publish_date ? job.publish_date.slice(0, 16) : '',
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this job post?')) return;
    await deleteJob(id);
    await load();
  };

  return (
    <section className="admin-section">
      <h2>Jobs</h2>
      <form className="editor-form" onSubmit={onSubmit}>
        <div className="form-row">
          <div>
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
          </div>
          <div>
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Department</label>
            <input value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} />
          </div>
          <div>
            <label>Location</label>
            <input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} />
          </div>
        </div>

        <label>Summary</label>
        <textarea value={form.summary} onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))} rows={3} />

        <label>Apply URL</label>
        <input value={form.applyUrl} onChange={(e) => setForm((prev) => ({ ...prev, applyUrl: e.target.value }))} />

        <label>Publish Date</label>
        <input
          type="datetime-local"
          value={form.publishDate}
          onChange={(e) => setForm((prev) => ({ ...prev, publishDate: e.target.value }))}
        />

        <div className="form-actions">
          <button type="submit">{editingId ? 'Update Job' : 'Create Job'}</button>
          {editingId ? (
            <button type="button" onClick={reset}>Cancel</button>
          ) : null}
        </div>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Department</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.department || '-'}</td>
                <td>{job.location || '-'}</td>
                <td>{job.status}</td>
                <td>
                  <div className="table-actions">
                    <button type="button" onClick={() => onEdit(job)}>Edit</button>
                    <button className="danger-btn" type="button" onClick={() => onDelete(job.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default JobsPage;
