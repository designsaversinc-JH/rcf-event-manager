import React from 'react';
import PostCard from './PostCard';

const PostList = ({ posts }) => {
  if (!posts?.length) {
    return (
      <div className="empty-state">
        <h3 style={{ marginBottom: '0.5rem' }}>No posts yet</h3>
        <p>
          Once published, your posts will appear here for readers to explore.
        </p>
      </div>
    );
  }

  return (
    <div className="post-grid">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;
