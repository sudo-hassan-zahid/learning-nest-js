import 'dotenv/config';
import { PrismaClient, PostStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// raw data

const USERS = [
  {
    id: 'seed-user-1',
    firstName: 'Hassan',
    lastName: 'Zahid',
    email: 'hassan@echowrite.dev',
    password: 'Admin1234!',
    bio: 'Founder of Echowrite. Full-stack engineer obsessed with clean APIs.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hassan',
  },
  {
    id: 'seed-user-2',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@echowrite.dev',
    password: 'Password1234!',
    bio: 'Frontend engineer and CSS wizard. Writes about React and design systems.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
  },
  {
    id: 'seed-user-3',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@echowrite.dev',
    password: 'Password1234!',
    bio: 'Backend engineer. Postgres enthusiast. Occasional open-source contributor.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
  },
];

const TAGS = [
  { id: 'seed-tag-1', name: 'TypeScript', slug: 'typescript' },
  { id: 'seed-tag-2', name: 'NestJS', slug: 'nestjs' },
  { id: 'seed-tag-3', name: 'React', slug: 'react' },
  { id: 'seed-tag-4', name: 'PostgreSQL', slug: 'postgresql' },
  { id: 'seed-tag-5', name: 'Redis', slug: 'redis' },
  { id: 'seed-tag-6', name: 'Web Development', slug: 'web-development' },
  { id: 'seed-tag-7', name: 'Open Source', slug: 'open-source' },
];

const POSTS: Array<{
  id: string;
  authorId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: PostStatus;
  publishedAt: Date | null;
  tagIds: string[];
}> = [
  {
    id: 'seed-post-1',
    authorId: 'seed-user-1',
    title: 'Building a Production-Grade API with NestJS',
    slug: 'building-production-grade-api-nestjs',
    excerpt: 'A deep dive into structuring a scalable NestJS application with Prisma, Redis, and JWT auth.',
    content: `# Building a Production-Grade API with NestJS

NestJS is one of the most powerful Node.js frameworks out there. In this post, I'll walk you through how we built the Echowrite API from scratch.

## What we'll cover

- Project structure and module design
- JWT authentication with HTTP-only cookies
- Redis for caching and token blacklisting
- Prisma ORM with connection pooling
- Rate limiting and security headers

## Getting started

First, scaffold the project with the Nest CLI...`,
    status: PostStatus.PUBLISHED,
    publishedAt: new Date('2026-01-15'),
    tagIds: ['seed-tag-1', 'seed-tag-2', 'seed-tag-6'],
  },
  {
    id: 'seed-post-2',
    authorId: 'seed-user-1',
    title: 'Why I Switched from REST to Cookie-Based Auth',
    slug: 'why-switched-cookie-based-auth',
    excerpt: 'Bearer tokens in localStorage are a bad idea. Here\'s why HTTP-only cookies are the right call for browser-based apps.',
    content: `# Why I Switched from REST to Cookie-Based Auth

For years I stored JWTs in localStorage. It's easy, it works, and every tutorial does it. But it's also wrong.

## The problem with localStorage

Anything in localStorage is accessible to JavaScript running on the page. That means any XSS vulnerability — no matter how small — can steal your users' tokens.

## HTTP-only cookies to the rescue

HTTP-only cookies cannot be read by JavaScript. Period. The browser sends them automatically on every request to the same origin, and an attacker's script can't access them.

## The trade-off

You need to handle CSRF properly. We do that with \`sameSite: 'lax'\` plus explicit CORS configuration...`,
    status: PostStatus.PUBLISHED,
    publishedAt: new Date('2026-02-03'),
    tagIds: ['seed-tag-6', 'seed-tag-1'],
  },
  {
    id: 'seed-post-3',
    authorId: 'seed-user-2',
    title: 'React Server Components: What Actually Changed',
    slug: 'react-server-components-what-actually-changed',
    excerpt: 'Cutting through the hype to explain what RSC actually means for how you build React apps today.',
    content: `# React Server Components: What Actually Changed

Everyone is talking about React Server Components. But most posts either oversimplify or overcomplicate it. Let me try to be clear.

## The core idea

A Server Component runs only on the server. It never ships JavaScript to the browser. That means zero bundle size impact for the component itself.

## What this means in practice

- You can fetch data directly in the component — no useEffect, no loading states
- You can use server-only libraries (database clients, secrets) without leaking them to the client
- You compose Server and Client components together in the same tree

## The gotcha

You can't use hooks or browser APIs in Server Components. The mental model shift is the hard part...`,
    status: PostStatus.PUBLISHED,
    publishedAt: new Date('2026-02-20'),
    tagIds: ['seed-tag-3', 'seed-tag-6'],
  },
  {
    id: 'seed-post-4',
    authorId: 'seed-user-3',
    title: 'Postgres Connection Pooling: A Practical Guide',
    slug: 'postgres-connection-pooling-practical-guide',
    excerpt: 'Most Node.js apps handle Postgres connections wrong. Here\'s how to configure pooling properly with pg and Prisma.',
    content: `# Postgres Connection Pooling: A Practical Guide

Every new connection to Postgres costs roughly 5–10 MB of memory and ~50ms to establish. If your app creates a new connection per request, you're in trouble at scale.

## How connection pooling works

A pool keeps a set of connections open and reuses them across requests. You configure a minimum (connections to keep warm) and maximum (hard cap).

## Configuring pg.Pool

\`\`\`typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  min: 2,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
\`\`\`

## What these settings mean

- **max: 10** — never open more than 10 connections
- **min: 2** — keep 2 warm so the first requests don't pay the connect cost
- **idleTimeoutMillis** — close a connection if it hasn't been used in 30s
- **connectionTimeoutMillis** — throw an error instead of queuing forever...`,
    status: PostStatus.PUBLISHED,
    publishedAt: new Date('2026-03-10'),
    tagIds: ['seed-tag-4', 'seed-tag-6'],
  },
  {
    id: 'seed-post-5',
    authorId: 'seed-user-3',
    title: 'Redis Beyond Caching: Blacklists, Rate Limits, and More',
    slug: 'redis-beyond-caching',
    excerpt: 'Redis is more than a cache. Here\'s how we use it for JWT blacklisting, rate limiting, and password reset tokens in Echowrite.',
    content: `# Redis Beyond Caching

Most developers discover Redis as a caching layer and stop there. But Redis is a versatile data structure store that shines in several other use cases.

## JWT Blacklisting

When a user logs out, the access token is still technically valid until it expires. We store the token's JTI in Redis with a TTL equal to the remaining token lifetime.

Every authenticated request checks the blacklist before proceeding.

## Rate Limiting

Our ThrottlerModule stores request counters in Redis instead of in-memory. This means rate limits work correctly across multiple app instances.

## Password Reset Tokens

Instead of storing reset tokens in Postgres (which requires a migration and a cleanup job), we store them in Redis with a 15-minute TTL. Redis handles expiry automatically...`,
    status: PostStatus.PUBLISHED,
    publishedAt: new Date('2026-04-01'),
    tagIds: ['seed-tag-5', 'seed-tag-6'],
  },
  {
    id: 'seed-post-6',
    authorId: 'seed-user-2',
    title: 'Design Systems in 2026: What I Wish I Knew Earlier',
    slug: 'design-systems-2026',
    excerpt: 'Three years of building design systems taught me a lot. Here are the lessons that actually matter.',
    content: `# Design Systems in 2026

Draft content coming soon...`,
    status: PostStatus.DRAFT,
    publishedAt: null,
    tagIds: ['seed-tag-3', 'seed-tag-6'],
  },
];

const COMMENTS = [
  {
    id: 'seed-comment-1',
    postId: 'seed-post-1',
    authorId: 'seed-user-2',
    content: 'This is exactly the kind of deep dive I needed. The part about Redis for token blacklisting is something I\'ve been looking for.',
    parentId: null,
  },
  {
    id: 'seed-comment-2',
    postId: 'seed-post-1',
    authorId: 'seed-user-3',
    content: 'Great post. One question — how do you handle token refresh on the client side when the access token expires mid-session?',
    parentId: null,
  },
  {
    id: 'seed-comment-3',
    postId: 'seed-post-1',
    authorId: 'seed-user-1',
    content: 'Good question John — the client catches the 401, hits /auth/refresh automatically, then retries the original request. I\'ll write a follow-up post on the client side.',
    parentId: 'seed-comment-2',
  },
  {
    id: 'seed-comment-4',
    postId: 'seed-post-2',
    authorId: 'seed-user-3',
    content: 'Bookmarked. I\'ve been meaning to move away from localStorage for ages. The CSRF trade-off explanation is the clearest I\'ve read.',
    parentId: null,
  },
  {
    id: 'seed-comment-5',
    postId: 'seed-post-3',
    authorId: 'seed-user-1',
    content: 'The "no hooks in Server Components" part is what trips everyone up initially. Good call calling it out directly.',
    parentId: null,
  },
  {
    id: 'seed-comment-6',
    postId: 'seed-post-3',
    authorId: 'seed-user-2',
    content: 'Thanks Hassan! Yeah it took me a while to internalise the mental model. Glad it landed.',
    parentId: 'seed-comment-5',
  },
  {
    id: 'seed-comment-7',
    postId: 'seed-post-4',
    authorId: 'seed-user-1',
    content: 'We ran into the "no pool, new connection per request" problem in production last year. Cost us 40% of our DB memory. This guide would have saved us.',
    parentId: null,
  },
  {
    id: 'seed-comment-8',
    postId: 'seed-post-5',
    authorId: 'seed-user-2',
    content: 'The password reset token in Redis idea is so clean. No migration, no cleanup job, TTL is free. Using this.',
    parentId: null,
  },
];

const LIKES = [
  { id: 'seed-like-1', postId: 'seed-post-1', userId: 'seed-user-2' },
  { id: 'seed-like-2', postId: 'seed-post-1', userId: 'seed-user-3' },
  { id: 'seed-like-3', postId: 'seed-post-2', userId: 'seed-user-2' },
  { id: 'seed-like-4', postId: 'seed-post-2', userId: 'seed-user-3' },
  { id: 'seed-like-5', postId: 'seed-post-3', userId: 'seed-user-1' },
  { id: 'seed-like-6', postId: 'seed-post-3', userId: 'seed-user-3' },
  { id: 'seed-like-7', postId: 'seed-post-4', userId: 'seed-user-1' },
  { id: 'seed-like-8', postId: 'seed-post-4', userId: 'seed-user-2' },
  { id: 'seed-like-9', postId: 'seed-post-5', userId: 'seed-user-1' },
  { id: 'seed-like-10', postId: 'seed-post-5', userId: 'seed-user-2' },
];

const SHARE_LINKS = [
  {
    id: 'seed-share-1',
    postId: 'seed-post-1',
    shortCode: 'ew-post1',
    expiresAt: new Date('2027-01-01'),
  },
  {
    id: 'seed-share-2',
    postId: 'seed-post-3',
    shortCode: 'ew-post3',
    expiresAt: new Date('2027-01-01'),
  },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding Echowrite...\n');

  // Users
  console.log('Users');
  for (const u of USERS) {
    const password = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password },
    });
    console.log(`   + ${u.email}`);
  }

  // Tags
  console.log('\nTags');
  for (const t of TAGS) {
    await prisma.tag.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
    console.log(`   + ${t.name}`);
  }

  // Posts + PostTags
  console.log('\nPosts');
  for (const { tagIds, ...p } of POSTS) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...p,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    });
    console.log(`   + ${p.title} [${p.status}]`);
  }

  // Comments
  // Insert top-level first, then replies (foreign key on parentId)
  console.log('\nComments');
  const topLevel = COMMENTS.filter((c) => !c.parentId);
  const replies = COMMENTS.filter((c) => c.parentId);

  for (const c of [...topLevel, ...replies]) {
    await prisma.comment.upsert({
      where: { id: c.id },
      update: {},
      create: c,
    });
    console.log(`   + ${c.id} on post ${c.postId}`);
  }

  // Likes
  console.log('\nLikes');
  for (const l of LIKES) {
    await prisma.like.upsert({
      where: { postId_userId: { postId: l.postId, userId: l.userId } },
      update: {},
      create: l,
    });
  }
  console.log(`   + ${LIKES.length} likes`);

  // Share links
  console.log('\nShare links');
  for (const s of SHARE_LINKS) {
    await prisma.shareLink.upsert({
      where: { shortCode: s.shortCode },
      update: {},
      create: s,
    });
    console.log(`   + /s/${s.shortCode} -> post ${s.postId}`);
  }

  console.log('\nDone.\n');
  console.log('Seed accounts:');
  console.log('  hassan@echowrite.dev  /  Admin1234!');
  console.log('  jane@echowrite.dev    /  Password1234!');
  console.log('  john@echowrite.dev    /  Password1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
