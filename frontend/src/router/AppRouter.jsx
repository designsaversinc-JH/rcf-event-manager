import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LandingPage from '../pages/Public/LandingPage';
import AllBlogsPage from '../pages/Public/AllBlogsPage';
import VideoBlogsPage from '../pages/Public/VideoBlogsPage';
import PostDetailPage from '../pages/Public/PostDetailPage';
import LoginPage from '../pages/Admin/LoginPage';
import DashboardPage from '../pages/Admin/DashboardPage';
import PostsPage from '../pages/Admin/PostsPage';
import PostEditorPage from '../pages/Admin/PostEditorPage';
import PostViewPage from '../pages/Admin/PostViewPage';
import JobsPage from '../pages/Admin/JobsPage';
import SettingsPage from '../pages/Admin/SettingsPage';
import HelpPage from '../pages/Admin/HelpPage';
import ProfilePage from '../pages/Admin/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<PublicLayout />}>
      <Route index element={<LandingPage />} />
      <Route path="all-blogs" element={<AllBlogsPage />} />
      <Route path="video-blogs" element={<VideoBlogsPage />} />
      <Route path="blogs/:identifier" element={<PostDetailPage />} />
    </Route>

    <Route path="/admin/login" element={<LoginPage />} />

    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="posts" element={<PostsPage />} />
      <Route path="posts/new" element={<PostEditorPage />} />
      <Route path="posts/:id/view" element={<PostViewPage />} />
      <Route path="posts/:id/edit" element={<PostEditorPage />} />
      <Route path="jobs" element={<JobsPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="help" element={<HelpPage />} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRouter;
