# HomeHarbor: Simplified Architecture Guide

**Mission**: Build a beautiful, impressive real estate marketplace with minimal complexity and maximum developer experience.

**Philosophy**: Use modern tools that eliminate boilerplate, reduce bundle size, and provide excellent TypeScript support out of the box.

---

## Executive Summary

After extensive research into modern full-stack development, we're adopting the **T3 Stack** approach with strategic enhancements. This architecture prioritizes:

✅ **Simplicity** - Minimal configuration, maximum productivity  
✅ **Type Safety** - End-to-end TypeScript without code generation  
✅ **Lightweight** - Small bundle sizes, fast load times  
✅ **Beautiful** - Modern UI with shadcn/ui components  
✅ **Scalable** - Start simple, scale when needed  

---

## Tech Stack Comparison

### Traditional Stack (Heavy) vs. Simplified Stack (Light)

| Concern | Heavy Approach | Light Approach | Why Light Wins |
|---------|---------------|----------------|----------------|
| **Backend API** | NestJS (30MB+ dependencies) | tRPC (zero deps, 37KB) | Type-safe without GraphQL complexity |
| **Database ORM** | TypeORM (complex) | Prisma (intuitive, type-safe) | Better DX, auto-generated types |
| **UI Components** | Material-UI/Ant Design (large) | shadcn/ui (copy-paste) | Zero runtime JS, full control |
| **Styling** | CSS-in-JS (runtime cost) | Tailwind CSS (build-time) | No runtime overhead |
| **State Management** | Redux/MobX (boilerplate) | React Server Components + URL state | Simpler mental model |
| **Deployment** | AWS ECS + RDS + Redis | Vercel + Vercel Postgres | Zero config, instant deployments |

**Result**: ~70% less code, ~60% smaller bundles, 10x faster development

---

## Recommended Architecture: T3 Stack + Enhancements

### Core Stack (T3)

```bash
npm create t3-app@latest home-harbor
# Select: Next.js, TypeScript, tRPC, Prisma, Tailwind, NextAuth
```

**What you get out of the box:**
- ✅ Next.js 14 App Router (file-based routing, RSC, Server Actions)
- ✅ tRPC (end-to-end type safety without GraphQL)
- ✅ Prisma (type-safe database access)
- ✅ Tailwind CSS (utility-first styling)
- ✅ NextAuth.js (authentication)
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier configured

### Enhanced Stack (T3 + Beautiful UI)

```bash
# Add shadcn/ui for beautiful components
npx shadcn@latest init

# Key components we'll use:
npx shadcn@latest add button card input select
npx shadcn@latest add dialog dropdown-menu tabs
npx shadcn@latest add carousel badge avatar
```

**Project Structure:**
```
home-harbor/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (marketing)/       # Public pages (no auth)
│   │   │   ├── page.tsx       # Homepage with search
│   │   │   ├── properties/    # Property listings
│   │   │   └── about/         # About page
│   │   ├── (dashboard)/       # Protected pages
│   │   │   ├── dashboard/     # User dashboard
│   │   │   ├── favorites/     # Saved properties
│   │   │   └── settings/      # User settings
│   │   └── api/               # API routes (NextAuth)
│   │       └── auth/
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── property/          # Property-specific components
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyDetail.tsx
│   │   │   └── PropertySearch.tsx
│   │   └── layout/            # Layout components
│   ├── server/                # Backend code
│   │   ├── api/               # tRPC API routes
│   │   │   ├── routers/
│   │   │   │   ├── property.ts
│   │   │   │   ├── user.ts
│   │   │   │   └── search.ts
│   │   │   └── root.ts
│   │   └── db.ts              # Prisma client
│   ├── lib/                   # Utilities
│   │   ├── utils.ts
│   │   └── validations.ts     # Zod schemas
│   └── styles/
│       └── globals.css
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample data
└── public/
    └── images/
```

---

## Database Schema (Prisma)

### Simple, Scalable Schema

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  properties    Property[]
  favorites     Favorite[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Property {
  id          String     @id @default(cuid())
  title       String
  description String
  price       Int
  bedrooms    Int
  bathrooms   Int
  sqft        Int
  address     String
  city        String
  state       String
  zip         String
  latitude    Float
  longitude   Float
  images      String[]   // Array of image URLs
  status      String     @default("active") // active, pending, sold
  userId      String
  user        User       @relation(fields: [userId], references: [id])
  favorites   Favorite[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([city, state])
  @@index([price])
  @@index([status])
}

model Favorite {
  id         String   @id @default(cuid())
  userId     String
  propertyId String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())

  @@unique([userId, propertyId])
}

// NextAuth required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

**Why this schema works:**
- Simple relationships, no complex joins
- Built-in indexes for common queries
- Array types for images (no separate table needed)
- NextAuth integration out of the box

---

## API Layer: tRPC Instead of NestJS

### Why tRPC Over GraphQL/REST?

**GraphQL Problems:**
- ❌ Requires schema definition language
- ❌ Code generation step
- ❌ Resolvers boilerplate
- ❌ Large client libraries (Apollo ~40KB)

**tRPC Benefits:**
- ✅ No schema or code generation
- ✅ End-to-end type safety
- ✅ Tiny bundle size (3KB client)
- ✅ Uses existing TypeScript types
- ✅ Works with React Server Components

### Example tRPC Router

```typescript
// src/server/api/routers/property.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const propertyRouter = createTRPCRouter({
  // Get all properties with filters
  getAll: publicProcedure
    .input(
      z.object({
        city: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        bedrooms: z.number().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { city, minPrice, maxPrice, bedrooms, limit, cursor } = input;

      const properties = await ctx.db.property.findMany({
        where: {
          AND: [
            city ? { city: { contains: city, mode: "insensitive" } } : {},
            minPrice ? { price: { gte: minPrice } } : {},
            maxPrice ? { price: { lte: maxPrice } } : {},
            bedrooms ? { bedrooms: { gte: bedrooms } } : {},
            { status: "active" },
          ],
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined = undefined;
      if (properties.length > limit) {
        const nextItem = properties.pop();
        nextCursor = nextItem!.id;
      }

      return {
        properties,
        nextCursor,
      };
    }),

  // Get single property by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const property = await ctx.db.property.findUnique({
        where: { id: input.id },
        include: { user: { select: { name: true, email: true } } },
      });

      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }

      return property;
    }),

  // Create property (protected)
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5).max(100),
        description: z.string().min(20),
        price: z.number().positive(),
        bedrooms: z.number().int().positive(),
        bathrooms: z.number().positive(),
        sqft: z.number().int().positive(),
        address: z.string(),
        city: z.string(),
        state: z.string().length(2),
        zip: z.string().length(5),
        latitude: z.number(),
        longitude: z.number(),
        images: z.array(z.string().url()).min(1).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.property.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  // Toggle favorite
  toggleFavorite: protectedProcedure
    .input(z.object({ propertyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.favorite.findUnique({
        where: {
          userId_propertyId: {
            userId: ctx.session.user.id,
            propertyId: input.propertyId,
          },
        },
      });

      if (existing) {
        await ctx.db.favorite.delete({ where: { id: existing.id } });
        return { favorited: false };
      } else {
        await ctx.db.favorite.create({
          data: {
            userId: ctx.session.user.id,
            propertyId: input.propertyId,
          },
        });
        return { favorited: true };
      }
    }),
});
```

### Client-Side Usage

```typescript
// app/properties/page.tsx
"use client";

import { api } from "~/trpc/react";

export default function PropertiesPage() {
  // Fully typed, autocomplete everywhere!
  const { data, isLoading } = api.property.getAll.useQuery({
    city: "Seattle",
    minPrice: 300000,
    maxPrice: 800000,
    bedrooms: 3,
  });

  if (isLoading) return <PropertySkeleton />;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
```

**No schema files. No code generation. Just works.** ✨

---

## UI Components: shadcn/ui Philosophy

### Copy-Paste Components, Not NPM Packages

Traditional approach:
```bash
npm install @mui/material @emotion/react @emotion/styled
# Bundle size: +500KB, vendor lock-in
```

shadcn/ui approach:
```bash
npx shadcn@latest add button
# Copies button.tsx to your components/ui folder
# Bundle size: +2KB, full customization
```

### Example: Property Card Component

```typescript
// components/property/PropertyCard.tsx
import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { BedIcon, BathIcon, SquareIcon, HeartIcon } from "lucide-react";
import { api } from "~/trpc/react";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    images: string[];
    city: string;
    state: string;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const utils = api.useUtils();
  const toggleFavorite = api.property.toggleFavorite.useMutation({
    onSuccess: () => utils.property.getAll.invalidate(),
  });

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/properties/${property.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <Badge className="absolute left-3 top-3 bg-background/95">
            For Sale
          </Badge>
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="line-clamp-1 text-lg font-semibold">
              {property.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {property.city}, {property.state}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite.mutate({ propertyId: property.id })}
          >
            <HeartIcon className="h-5 w-5" />
          </Button>
        </div>

        <p className="mb-4 text-2xl font-bold">
          ${property.price.toLocaleString()}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BedIcon className="h-4 w-4" />
            {property.bedrooms} beds
          </div>
          <div className="flex items-center gap-1">
            <BathIcon className="h-4 w-4" />
            {property.bathrooms} baths
          </div>
          <div className="flex items-center gap-1">
            <SquareIcon className="h-4 w-4" />
            {property.sqft.toLocaleString()} sqft
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Benefits:**
- ✅ Beautiful out of the box
- ✅ Fully customizable (it's YOUR code)
- ✅ Tiny bundle (only what you use)
- ✅ Accessible by default (Radix UI primitives)
- ✅ Works with Tailwind

---

## Deployment: Vercel vs. AWS

### Complexity Comparison

**AWS ECS Deployment:**
```yaml
# Requires:
- VPC configuration
- Load balancer setup
- ECS cluster creation
- Task definitions
- RDS database provisioning
- Redis cluster setup
- S3 bucket configuration
- CloudFront distribution
- Route53 DNS setup
- IAM roles and policies
- Security groups
- Auto-scaling configuration

Time to deploy: 2-4 hours
Configuration files: ~500 lines
Cost: ~$100-200/month minimum
```

**Vercel Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# That's it! ✨
```

**What Vercel provides automatically:**
- ✅ Global CDN (300+ edge locations)
- ✅ Automatic HTTPS
- ✅ Preview deployments for every PR
- ✅ Serverless functions (no server management)
- ✅ Edge runtime for ultra-fast APIs
- ✅ Built-in analytics
- ✅ Instant rollbacks
- ✅ Zero-downtime deployments

### Database: Vercel Postgres vs. AWS RDS

**Vercel Postgres (Neon):**
```bash
# Create database
npx create-db

# Get connection string automatically
# DATABASE_URL is set as environment variable

# Deploy
vercel

# Database scales to zero when not in use
# Pay only for what you use
```

**Cost Comparison:**
- AWS RDS: $15-30/month minimum (always running)
- Vercel Postgres: $0-10/month for hobby projects (scales to zero)

### Migration Path

Start with Vercel, migrate to AWS later if needed:

```mermaid
graph LR
    A[MVP on Vercel] --> B{Growing Traffic?}
    B -->|Yes| C[Add Vercel Pro]
    B -->|Massive Scale?| D[Migrate specific parts to AWS]
    C --> B
    D --> E[Hybrid: Vercel + AWS]
```

---

## Performance Optimizations

### Image Optimization (Built-in)

```typescript
import Image from "next/image";

// Next.js automatically:
// ✅ Serves WebP/AVIF
// ✅ Lazy loads images
// ✅ Responsive images
// ✅ Blur placeholder
<Image
  src={property.images[0]}
  alt={property.title}
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL={property.imageBlurHash}
/>
```

### Code Splitting (Automatic)

```typescript
// This component is only loaded when needed
const PropertyMap = dynamic(() => import("./PropertyMap"), {
  loading: () => <MapSkeleton />,
  ssr: false, // Don't render on server (maps need window)
});
```

### Data Caching

```typescript
// Cache property details for 1 hour
export const revalidate = 3600;

export default async function PropertyPage({ params }) {
  const property = await db.property.findUnique({
    where: { id: params.id },
  });

  return <PropertyDetail property={property} />;
}
```

---

## Development Workflow

### Local Development

```bash
# 1. Clone and install
git clone <repo>
cd home-harbor
npm install

# 2. Setup database
cp .env.example .env
# Add DATABASE_URL to .env
npx prisma db push
npx prisma db seed

# 3. Start dev server
npm run dev
# Server: http://localhost:3000
# Database Studio: npx prisma studio
```

### Adding a New Feature

```bash
# 1. Update database schema
# Edit prisma/schema.prisma
npx prisma db push

# 2. Create tRPC endpoint
# Edit src/server/api/routers/*.ts

# 3. Add UI component
npx shadcn@latest add <component>
# Edit src/components/*

# 4. Create page
# Edit src/app/*/page.tsx

# 5. Test and deploy
npm run build
vercel
```

**Time to add feature: ~30 minutes vs. 2-3 hours with traditional stack**

---

## Bundle Size Comparison

### Traditional Stack
```
Material-UI core: 350KB
Apollo Client: 40KB
Redux + toolkit: 45KB
TypeORM: 25KB
Total: ~460KB (gzipped: ~120KB)
```

### Simplified Stack
```
tRPC client: 3KB
Prisma client: 15KB (tree-shakeable)
shadcn/ui: ~2KB per component
Total: ~20-30KB (gzipped: ~8KB)
```

**Result: 85% smaller JavaScript bundles** 🎉

---

## Migration from Complex Architecture

If you've already started with NestJS + GraphQL + TypeORM:

### Phase 1: Frontend Migration
1. Keep existing backend
2. Replace Apollo with tRPC
3. Replace Material-UI with shadcn/ui
4. Deploy frontend to Vercel

### Phase 2: Backend Simplification
1. Create new Next.js API routes
2. Add Prisma alongside TypeORM
3. Gradually migrate endpoints to tRPC
4. Remove old GraphQL layer

### Phase 3: Database Migration
1. Generate Prisma schema from existing DB
2. Test queries side-by-side
3. Switch production traffic
4. Remove TypeORM

**Timeline: 2-3 weeks vs. 2-3 months for full rewrite**

---

## Cost Analysis

### Year 1 Costs (MVP to 10K users)

**AWS Approach:**
```
ECS Fargate: $50/month
RDS PostgreSQL: $30/month
ElastiCache Redis: $15/month
S3 + CloudFront: $10/month
Load Balancer: $20/month
Total: $125/month = $1,500/year
```

**Vercel Approach:**
```
Vercel Pro: $20/month
Vercel Postgres: $10/month (scales with usage)
Total: $30/month = $360/year
```

**Savings: $1,140/year (76% less)** 💰

---

## Real-World Examples

### Companies Using This Stack

1. **Vercel** (obviously) - Built on Next.js + Vercel
2. **Cal.com** - Scheduling platform (T3 Stack)
3. **Taxonomy** - SaaS starter (Next.js + Prisma)
4. **Dub.co** - Link shortener (T3 Stack)
5. **Ping.gg** - Social platform (tRPC + Prisma)

### GitHub Templates

```bash
# Create from template
npx create-t3-app@latest

# Or use official Next.js
npx create-next-app@latest --typescript --tailwind --app

# Add tRPC manually
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next
```

---

## Recommended Learning Path

1. **Week 1**: Next.js fundamentals
   - [Next.js Tutorial](https://nextjs.org/learn)
   - Build a simple blog

2. **Week 2**: Database with Prisma
   - [Prisma Quickstart](https://www.prisma.io/docs/getting-started/quickstart)
   - Create a todo app

3. **Week 3**: tRPC integration
   - [tRPC Documentation](https://trpc.io/docs)
   - Add API to todo app

4. **Week 4**: UI with shadcn/ui
   - [shadcn/ui docs](https://ui.shadcn.com/docs)
   - Build component library

5. **Week 5**: Build HomeHarbor MVP
   - Combine everything
   - Deploy to Vercel

---

## Decision Matrix

### When to Use This Stack

✅ **Use T3 + Vercel when:**
- Building MVP or new product
- Team size < 10 developers
- Budget conscious
- Want fast iteration
- TypeScript is primary language
- Don't need multi-region compliance

❌ **Stick with AWS when:**
- Enterprise compliance requirements
- Need multi-region data sovereignty
- Have dedicated DevOps team
- Already heavily invested in AWS
- Need bare-metal performance
- Require custom infrastructure

---

## Final Recommendation

### For HomeHarbor MVP

```typescript
const recommendation = {
  frontend: "Next.js 14 App Router",
  backend: "tRPC + Next.js API Routes",
  database: "Prisma + Vercel Postgres",
  styling: "Tailwind CSS",
  components: "shadcn/ui",
  auth: "NextAuth.js",
  deployment: "Vercel",
  
  rationale: {
    simplicity: "Single framework, zero config",
    cost: "~$30/month vs $125/month",
    speed: "Deploy in seconds, not hours",
    dx: "Best developer experience available",
    scalability: "Scales automatically with traffic",
  },

  migrationPath: {
    now: "Build MVP on Vercel",
    later: "Add AWS services as needed",
    never: "Don't build what you don't need",
  }
};
```

### Getting Started

```bash
# 1. Create project
npx create-t3-app@latest home-harbor --prisma --trpc --tailwind --nextAuth

# 2. Add UI components
cd home-harbor
npx shadcn@latest init
npx shadcn@latest add button card input select dialog

# 3. Configure database
npx create-db

# 4. Start building
npm run dev
```

**You'll have a production-ready foundation in under 30 minutes.** 🚀

---

## Resources

- [T3 Stack Documentation](https://create.t3.gg/)
- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Last Updated**: January 31, 2026  
**Architecture Owner**: Engineering Team  
**Review Cycle**: Quarterly

---

## Appendix: Quick Start Commands

```bash
# Complete setup in 5 minutes
npx create-t3-app@latest home-harbor \
  --prisma \
  --trpc \
  --tailwind \
  --nextAuth

cd home-harbor
npx shadcn@latest init
npx create-db

# Add core components
npx shadcn@latest add button card input select dialog badge avatar

# Start development
npm run dev

# Deploy
npx vercel

# Done! ✨
```
