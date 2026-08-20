import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse flex flex-col h-full card-shadow">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-5/6 bg-gray-200 rounded-md"></div>
          <div className="h-4 w-full bg-gray-200/70 rounded-md"></div>
          <div className="h-4 w-3/4 bg-gray-200/70 rounded-md"></div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const PageSpinner = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-semibold text-gray-600 animate-pulse">Loading PayUBlog...</p>
    </div>
  );
};
