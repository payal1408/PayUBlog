const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const slugify = require('./slugify');
const calculateReadingTime = require('./readingTime');

const sampleAuthors = [
  {
    name: 'Rahul Sharma',
    username: 'rahul_sharma',
    email: 'rahul.sharma@payublog.com',
    password: 'Password123!',
    bio: 'Lead Engineering Architect at PayU. Writing about payment gateway security, microservices, and backend performance.',
    profileImage: {
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    },
    socialLinks: {
      twitter: 'https://twitter.com/rahul_sharma',
      github: 'https://github.com/rahulsharma',
      linkedin: 'https://linkedin.com/in/rahulsharma',
      website: 'https://rahulsharma.dev',
    },
  },
  {
    name: 'Ananya Verma',
    username: 'ananya_verma',
    email: 'ananya.verma@payublog.com',
    password: 'Password123!',
    bio: 'Senior Frontend Developer. Passionate about React, performance optimization, and clean UI engineering.',
    profileImage: {
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    },
    socialLinks: {
      twitter: 'https://twitter.com/ananya_verma',
      github: 'https://github.com/ananyaverma',
      linkedin: 'https://linkedin.com/in/ananyaverma',
    },
  },
  {
    name: 'Vikram Patel',
    username: 'vikram_patel',
    email: 'vikram.patel@payublog.com',
    password: 'Password123!',
    bio: 'DevOps & Cloud Security Specialist. Working on Kubernetes deployments, CI/CD pipelines, and zero-trust backend systems.',
    profileImage: {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    },
    socialLinks: {
      github: 'https://github.com/vikrampatel',
      linkedin: 'https://linkedin.com/in/vikrampatel',
    },
  },
];

const sampleBlogs = [
  {
    title: 'Integrating PayU Payment Gateway in Node.js & React Applications',
    description: 'A step-by-step practical guide to integrating PayU payments, handling webhooks, validating payment hashes, and managing order status safely.',
    category: 'Web Development',
    tags: ['payu', 'nodejs', 'react', 'payments', 'express'],
    coverImage: {
      url: 'https://images.unsplash.com/photo-1556742049-0a67568d0d9f?auto=format&fit=crop&q=80&w=1200',
    },
    content: `
# Integrating PayU Payment Gateway in Node.js & React

Payment integration is a critical feature for e-commerce platforms and digital services. PayU provides a robust API for seamlessly processing credit cards, debit cards, UPI, and net banking.

## Step 1: Generating Payment Hashes on Node.js Server

Never calculate or store secret keys on the frontend. The payment hash must be computed securely on the Express server:

\`\`\`javascript
const crypto = require('crypto');

function generatePayUHash(params, salt) {
  const hashString = \`\${params.key}|\${params.txnid}|\${params.amount}|\${params.productinfo}|\${params.firstname}|\${params.email}|||||||||||\${salt}\`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
}
\`\`\`

## Step 2: Initiating Payment Request in React

The React client sends order details to the backend API, receives the payment hash, and redirects to PayU gateway:

\`\`\`javascript
async function handleCheckout() {
  const response = await fetch('/api/payments/initiate', {
    method: 'POST',
    body: JSON.stringify({ amount: 499, productinfo: 'Subscription' })
  });
  const data = await response.json();
  // Submit form to PayU gateway endpoint
}
\`\`\`

## Key Security Best Practices

1. **Verify Response Hashes:** Always recalculate and verify the return hash when PayU redirects back to your success webhook.
2. **Use HTTPS:** Ensure all endpoints run over TLS encryption.
3. **Idempotent Order Handling:** Prevent duplicate order fulfillment by checking transaction IDs in your database.

This architecture ensures seamless checkout for users while maintaining robust PCI compliance standards.
    `,
    views: 1850,
    status: 'published',
  },
  {
    title: 'Scaling Node.js Microservices to 10 Million Daily Requests',
    description: 'Practical infrastructure patterns for optimizing Express.js throughput, database connection pooling, Redis caching, and load balancing.',
    category: 'Technology',
    tags: ['nodejs', 'express', 'mongodb', 'performance', 'redis'],
    coverImage: {
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200',
    },
    content: `
# Scaling Node.js Microservices to 10 Million Requests

As application traffic grows, scaling Node.js applications requires intentional choices around process management, database query optimization, and caching strategies.

## Process Clustering & Event Loop Optimization

Node.js operates on a single-threaded event loop. To leverage multi-core CPUs, utilize Node cluster module or PM2:

\`\`\`javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Start Express worker process
}
\`\`\`

## Redis Caching Strategy

Cache database reads for high-traffic endpoints (such as top blog posts or user profiles):

- **Cache Time-To-Live (TTL):** Set sensible expiration times (e.g., 5 minutes for blog feeds).
- **Cache Invalidation:** Clear cached post data whenever an author updates a blog.

## Summary

By combining Redis caching, connection pooling in Mongoose, and multi-core clustering, Node.js applications can handle high concurrency with low latency.
    `,
    views: 1240,
    status: 'published',
  },
  {
    title: 'Clean Code Principles for Modern React Applications',
    description: 'How to write maintainable, modular React code using custom hooks, clean component structure, and predictable state management.',
    category: 'Programming',
    tags: ['react', 'javascript', 'frontend', 'clean-code'],
    coverImage: {
      url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200',
    },
    content: `
# Clean Code Principles in React

Building scalable frontend applications requires clean, self-documenting code that team members can quickly read, test, and maintain.

## 1. Keep Components Focused (Single Responsibility)

A component should ideally do one thing. If a component handles data fetching, complex form validation, and complex rendering, break it down:

- **Custom Hooks:** Move business logic and API requests to reusable hooks (e.g., \`useFetchBlogs\`).
- **UI Components:** Keep UI rendering clean and decoupled from network state.

## 2. Prefer Meaningful Prop Names

Avoid ambiguous names like \`data1\` or \`handleStuff\`. Use explicit names like \`isLikedByCurrentUser\` or \`onConfirmDelete\`.

## Conclusion

Writing clean code reduces bug counts and speeds up feature releases across development teams.
    `,
    views: 910,
    status: 'published',
  },
];

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      // Synchronize exact dynamic reading time for all existing database records
      const existingBlogs = await Blog.find();
      for (const blog of existingBlogs) {
        const correctReadingTime = calculateReadingTime(blog.content);
        if (blog.readingTime !== correctReadingTime) {
          blog.readingTime = correctReadingTime;
          await blog.save();
        }
      }
      return;
    }

    console.log('[Seed] Seeding database with PayUBlog content...');

    const createdAuthors = await User.create(sampleAuthors);
    console.log(`[Seed] Created ${createdAuthors.length} sample authors.`);

    for (let i = 0; i < sampleBlogs.length; i++) {
      const bData = sampleBlogs[i];
      const author = createdAuthors[i % createdAuthors.length];
      const slug = slugify(bData.title);
      const readingTime = calculateReadingTime(bData.content);

      const blog = await Blog.create({
        ...bData,
        slug,
        author: author._id,
        readingTime,
      });

      await Comment.create({
        blog: blog._id,
        user: createdAuthors[(i + 1) % createdAuthors.length]._id,
        content: 'Great post! The explanation of payment hash verification on the server is clear and practical.',
      });

      await Like.create({
        blog: blog._id,
        user: createdAuthors[(i + 1) % createdAuthors.length]._id,
      });
      await Like.create({
        blog: blog._id,
        user: createdAuthors[(i + 2) % createdAuthors.length]._id,
      });
    }

    console.log('[Seed] PayUBlog seed data created successfully.');
  } catch (err) {
    console.error('[Seed Error]', err.message);
  }
};

module.exports = seedDatabase;
