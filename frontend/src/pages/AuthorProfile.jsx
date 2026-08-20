import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AuthorCard from '../components/AuthorCard/AuthorCard';
import BlogGrid from '../components/BlogGrid/BlogGrid';
import { PageSpinner } from '../components/Loading/SkeletonCard';
import API from '../services/api';

const AuthorProfile = () => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/users/author/${username}`);
        if (response.data?.success) {
          setProfileData(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch author profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) return <PageSpinner />;
  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Author Profile Not Found</h2>
        <p className="text-slate-400">The author profile @{username} does not exist or has been removed.</p>
      </div>
    );
  }

  const { author, totalBlogs, totalLikes, blogs } = profileData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Author Details Banner */}
      <AuthorCard author={author} totalBlogs={totalBlogs} totalLikes={totalLikes} />

      {/* Published Publications */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white tracking-tight">
          Publications by {author.name} ({blogs.length})
        </h3>
        <BlogGrid
          blogs={blogs.map((b) => ({ ...b, author }))}
          emptyMessage={`${author.name} has not published any articles yet.`}
        />
      </div>
    </div>
  );
};

export default AuthorProfile;
