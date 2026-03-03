import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createBlog,
  fetchAdminBlog,
  fetchCategories,
  fetchTags,
  updateBlog,
} from '../../api/admin';
import { uploadFileToFirebaseStorage } from '../../utils/firebaseStorageUpload';
import usePageMeta from '../../hooks/usePageMeta';

const initialForm = {
  title: '',
  summary: '',
  category: '',
  status: 'published',
  blogType: 'written',
  coverImg: '',
  blogURL: '',
  content: '',
  vlogContent: '',
  vlogEmbed: '',
  vlogURL: '',
  publishDate: '',
  blogTags: '',
};

const STATUS_OPTIONS = [
  { value: 'published', label: 'Posted' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Waiting Approval' },
  { value: 'archived', label: 'Archived' },
];

const PostEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = useMemo(() => Boolean(id), [id]);

  usePageMeta({
    title: `${isEdit ? 'Edit Event' : 'Create Event'} | Roseland Ceasefire`,
    description: 'Create and edit written or video event updates.',
    canonicalUrl: isEdit ? `/admin/posts/${id}/edit` : '/admin/posts/new',
    noIndex: true,
  });

  useEffect(() => {
    const load = async () => {
      const [categoryRes, tagRes] = await Promise.all([fetchCategories(), fetchTags()]);
      setCategories(categoryRes.data || []);
      setTags(tagRes.data || []);

      if (id) {
        const response = await fetchAdminBlog(id);
        const blog = response.data;
        setForm({
          title: blog.title || '',
          summary: blog.summary || '',
          category: blog.category || '',
          status: blog.status || 'draft',
          blogType: blog.blogType || 'written',
          coverImg: blog.coverImg || '',
          blogURL: blog.blogURL || '',
          content: blog.content || '',
          vlogContent: blog.vlogContent || '',
          vlogEmbed: blog.vlogEmbed || '',
          vlogURL: blog.vlogURL || '',
          publishDate: blog.publishDate ? blog.publishDate.slice(0, 16) : '',
          blogTags: (blog.blogTags || []).join(', '),
        });
      }
    };

    load();
  }, [id]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const onUploadCover = async () => {
    if (!coverFile) {
      return;
    }

    setIsUploadingCover(true);
    try {
      const url = await uploadFileToFirebaseStorage({
        file: coverFile,
        folder: 'event-covers',
      });
      setForm((prev) => ({ ...prev, coverImg: url }));
      setCoverFile(null);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const onUploadVideo = async () => {
    if (!videoFile) {
      return;
    }

    setIsUploadingVideo(true);
    try {
      const url = await uploadFileToFirebaseStorage({
        file: videoFile,
        folder: 'event-videos',
      });
      setForm((prev) => ({ ...prev, vlogURL: url, vlogEmbed: '' }));
      setVideoFile(null);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const saveWithStatus = async (nextStatus) => {
    setIsSaving(true);
    const payload = {
      ...form,
      status: nextStatus,
      blogTags: form.blogTags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      publishDate: form.publishDate ? new Date(form.publishDate).toISOString() : null,
    };

    try {
      if (isEdit) {
        await updateBlog(id, payload);
      } else {
        await createBlog(payload);
      }
      navigate('/admin/posts');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="editor-page-shell">
      <h2>{isEdit ? 'Edit Event' : 'Create Event'}</h2>
      <form className="editor-form compact-editor">
        <label>Title</label>
        <input name="title" value={form.title} onChange={onChange} required />

        <label>Summary</label>
        <textarea name="summary" value={form.summary} onChange={onChange} rows={3} />

        <div className="form-row">
          <div>
            <label>Category</label>
            <input list="category-list" name="category" value={form.category} onChange={onChange} />
            <datalist id="category-list">
              {categories.map((item) => <option key={item.id} value={item.name} />)}
            </datalist>
          </div>
          <div>
            <label>Status</label>
            <select name="status" value={form.status} onChange={onChange}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Event Type</label>
            <select name="blogType" value={form.blogType} onChange={onChange}>
              <option value="written">Written</option>
              <option value="video">Video</option>
            </select>
          </div>
        </div>

        <label>Publish Date</label>
        <input type="datetime-local" name="publishDate" value={form.publishDate} onChange={onChange} />

        <label>Cover Image URL</label>
        <input name="coverImg" value={form.coverImg} onChange={onChange} />
        {form.coverImg ? (
          <img className="media-preview-image" src={form.coverImg} alt="Cover preview" />
        ) : null}

        <div className="upload-row">
          <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
          <button type="button" onClick={onUploadCover} disabled={!coverFile || isUploadingCover}>
            {isUploadingCover ? 'Uploading image...' : 'Upload Cover Image'}
          </button>
        </div>

        <label>Event URL Slug</label>
        <input name="blogURL" value={form.blogURL} onChange={onChange} />

        <label>Tags (comma separated)</label>
        <input
          name="blogTags"
          value={form.blogTags}
          onChange={onChange}
          placeholder={`Suggestions: ${(tags || []).slice(0, 6).map((tag) => tag.name).join(', ')}`}
        />

        {form.blogType === 'written' ? (
          <>
            <label>Written Content</label>
            <div className="rich-toolbar">
              <button type="button" onClick={() => applyFormat('bold')}>B</button>
              <button type="button" onClick={() => applyFormat('italic')}><em>I</em></button>
              <button type="button" onClick={() => applyFormat('insertUnorderedList')}>• List</button>
              <button type="button" onClick={() => applyFormat('formatBlock', 'h2')}>H2</button>
              <button type="button" onClick={() => applyFormat('removeFormat')}>Clear</button>
            </div>
            <div
              className="rich-editor"
              contentEditable
              suppressContentEditableWarning
              onInput={(event) =>
                setForm((prev) => ({ ...prev, content: event.currentTarget.innerHTML }))
              }
              dangerouslySetInnerHTML={{ __html: form.content || '' }}
            />
          </>
        ) : (
          <>
            <label>Video Description</label>
            <textarea name="vlogContent" value={form.vlogContent} onChange={onChange} rows={5} />
            <label>Embed URL (YouTube/Vimeo)</label>
            <input
              name="vlogEmbed"
              value={form.vlogEmbed}
              onChange={onChange}
              placeholder="https://www.youtube.com/embed/..."
            />
            <label>Video File URL</label>
            <input name="vlogURL" value={form.vlogURL} onChange={onChange} />
            {form.vlogEmbed ? (
              <iframe
                title="Embed preview"
                className="media-preview-video"
                src={form.vlogEmbed}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : null}
            {!form.vlogEmbed && form.vlogURL ? (
              <video className="media-preview-video" src={form.vlogURL} controls preload="metadata" />
            ) : null}
            <div className="upload-row">
              <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
              <button type="button" onClick={onUploadVideo} disabled={!videoFile || isUploadingVideo}>
                {isUploadingVideo ? 'Uploading video...' : 'Upload Video File'}
              </button>
            </div>
          </>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="mode-switch"
            onClick={() => saveWithStatus('draft')}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => saveWithStatus('published')}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save and Post'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default PostEditorPage;
