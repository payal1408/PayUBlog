import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, Globe, BookOpen, Heart } from 'lucide-react';

const AuthorCard = ({ author, totalBlogs = 0, totalLikes = 0 }) => {
  if (!author) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 card-shadow">
      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
        {/* Avatar */}
        <Link to={`/author/${author.username}`} className="shrink-0 group">
          {author.profileImage?.url ? (
            <img
              src={author.profileImage.url}
              alt={author.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200 group-hover:border-emerald-500 transition-colors shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-600 group-hover:border-emerald-500 transition-colors shadow-md text-3xl">
              <i className="fa-solid fa-user"></i>
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div>
            <Link to={`/author/${author.username}`} className="group">
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                {author.name}
              </h3>
            </Link>
            <p className="text-sm font-semibold text-gray-500">@{author.username}</p>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed max-w-2xl">
            {author.bio || 'Author publishing engineering and tech insights on PayUBlog.'}
          </p>

          {/* Metrics */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>{totalBlogs} Published</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>{totalLikes} Likes</span>
            </div>

            {/* Social links */}
            {author.socialLinks && (
              <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
                {author.socialLinks.twitter && (
                  <a
                    href={author.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-500 hover:text-emerald-600 transition-colors p-1"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {author.socialLinks.github && (
                  <a
                    href={author.socialLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-500 hover:text-gray-900 transition-colors p-1"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {author.socialLinks.linkedin && (
                  <a
                    href={author.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-500 hover:text-emerald-600 transition-colors p-1"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {author.socialLinks.website && (
                  <a
                    href={author.socialLinks.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-500 hover:text-emerald-600 transition-colors p-1"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorCard;
