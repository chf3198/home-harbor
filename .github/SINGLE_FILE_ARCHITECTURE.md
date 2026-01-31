# Single-File Web App Architecture Guide

**Mission**: Build HomeHarbor as a lightweight, single-page application that can be distributed as a single HTML file while leveraging free cloud services for backend functionality.

**Philosophy**: Zero installation, maximum portability, minimal infrastructure costs.

---

## Executive Summary

A **single-file web app** approach uses modern browser capabilities + free cloud APIs to deliver a complete application experience without traditional server infrastructure.

**Key Benefits:**
- ✅ **Zero deployment complexity** - Just host a single HTML file
- ✅ **Offline-capable** - Can work without internet (with limitations)
- ✅ **Free hosting** - GitHub Pages, S3 free tier, or any CDN
- ✅ **Instant distribution** - Users download one file, double-click to run
- ✅ **No build process** - Direct development, instant updates

---

## Three Hosting Approaches Compared

### Option 1: GitHub Pages (RECOMMENDED)

**What it is**: Free static site hosting directly from your GitHub repository

**Cost**: $0/month forever  
**Bandwidth**: 100GB/month soft limit  
**Setup Time**: 5 minutes  
**Custom Domain**: Yes (free HTTPS)

**Setup:**
```bash
# 1. Create a special repository
git init
git remote add origin https://github.com/chf3198/home-harbor.git

# 2. Create index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>HomeHarbor - Find Your Dream Home</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <h1>HomeHarbor</h1>
    <script src="app.js"></script>
</body>
</html>
EOF

# 3. Commit and push
git add index.html
git commit -m "Initial commit"
git branch -M main
git push -u origin main

# 4. Enable GitHub Pages
# Go to: Settings → Pages → Source: main branch
# Site live at: https://chf3198.github.io/home-harbor/
```

**Pros:**
- ✅ Free forever, no credit card
- ✅ Automatic HTTPS
- ✅ Preview deployments via branches
- ✅ Git-based workflow
- ✅ 99.9% uptime SLA

**Cons:**
- ❌ 1GB repository size limit
- ❌ Public repositories only (for free tier)
- ❌ Soft 100GB bandwidth/month limit

---

### Option 2: AWS S3 + CloudFront

**What it is**: S3 stores files, CloudFront delivers globally via CDN

**Cost**: $0.01-$1/month for hobby traffic  
**Bandwidth**: First 100GB free (CloudFront), then $0.085/GB  
**Setup Time**: 30 minutes  
**Custom Domain**: Yes (requires Route 53 ~$0.50/month)

**Setup:**
```bash
# 1. Create S3 bucket
aws s3 mb s3://home-harbor-app --region us-east-2

# 2. Enable static website hosting
aws s3 website s3://home-harbor-app \
  --index-document index.html \
  --error-document 404.html

# 3. Set public read policy
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::home-harbor-app/*"
  }]
}
EOF

aws s3api put-bucket-policy \
  --bucket home-harbor-app \
  --policy file://bucket-policy.json

# 4. Upload files
aws s3 sync . s3://home-harbor-app \
  --exclude ".git/*" \
  --exclude "*.md" \
  --cache-control "max-age=3600"

# 5. Create CloudFront distribution (optional, for CDN)
aws cloudfront create-distribution \
  --origin-domain-name home-harbor-app.s3-website.us-east-2.amazonaws.com

# Site live at: http://home-harbor-app.s3-website.us-east-2.amazonaws.com
```

**Pros:**
- ✅ Unlimited scalability
- ✅ Global CDN with CloudFront
- ✅ Works with private repositories
- ✅ Fine-grained access control

**Cons:**
- ❌ Costs money (minimal, but not free)
- ❌ More complex setup
- ❌ Requires AWS account management

---

### Option 3: Hybrid (GitHub + Free APIs)

**What it is**: Host HTML/CSS/JS on GitHub Pages, use free cloud APIs for backend

**Cost**: $0/month  
**Best of both worlds**: Free hosting + powerful backend

**Stack:**
- **Frontend**: GitHub Pages (HTML/CSS/JS)
- **Database**: Supabase (500MB free, 50K users)
- **Auth**: Supabase Auth (built-in)
- **Storage**: Supabase Storage (1GB free)
- **Serverless Functions**: Supabase Edge Functions (500K/month free)

**This is the RECOMMENDED approach** ✨

---

## Single-File Web App Architecture

### The "True" Single File Approach

Bundle everything (HTML, CSS, JS, images) into ONE file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HomeHarbor - Real Estate Marketplace</title>
    
    <!-- Inline CSS -->
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .hero {
            text-align: center;
            color: white;
            padding: 4rem 2rem;
        }
        
        .hero h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            animation: fadeIn 1s ease-in;
        }
        
        .search-bar {
            background: white;
            border-radius: 50px;
            padding: 1rem 2rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            display: flex;
            gap: 1rem;
            margin: 2rem auto;
            max-width: 600px;
        }
        
        .search-bar input {
            flex: 1;
            border: none;
            outline: none;
            font-size: 1rem;
        }
        
        .search-bar button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 0.8rem 2rem;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: transform 0.2s;
        }
        
        .search-bar button:hover {
            transform: scale(1.05);
        }
        
        .properties {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        
        .property-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        
        .property-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .property-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            position: relative;
        }
        
        .property-badge {
            position: absolute;
            top: 1rem;
            left: 1rem;
            background: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .property-info {
            padding: 1.5rem;
        }
        
        .property-price {
            font-size: 1.8rem;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 0.5rem;
        }
        
        .property-address {
            color: #666;
            margin-bottom: 1rem;
        }
        
        .property-features {
            display: flex;
            gap: 1rem;
            font-size: 0.9rem;
            color: #888;
        }
        
        .feature {
            display: flex;
            align-items: center;
            gap: 0.3rem;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .loading {
            text-align: center;
            padding: 2rem;
            color: white;
            font-size: 1.2rem;
        }
    </style>
</head>
<body>
    <div class="hero">
        <h1>🏡 HomeHarbor</h1>
        <p>Find Your Dream Home</p>
        
        <div class="search-bar">
            <input 
                type="text" 
                id="searchInput" 
                placeholder="Search by city, neighborhood, or zip code..."
                autocomplete="off"
            >
            <button onclick="searchProperties()">Search</button>
        </div>
    </div>
    
    <div class="container">
        <div id="propertiesContainer" class="properties"></div>
        <div id="loading" class="loading" style="display: none;">Loading properties...</div>
    </div>

    <!-- Inline JavaScript -->
    <script>
        // Supabase Configuration (Free tier: https://supabase.com)
        const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
        const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
        
        // Simple Supabase client (no dependencies!)
        class SupabaseClient {
            constructor(url, key) {
                this.url = url;
                this.key = key;
            }
            
            async query(table, filters = {}) {
                const params = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    params.append(key, value);
                });
                
                const response = await fetch(`${this.url}/rest/v1/${table}?${params}`, {
                    headers: {
                        'apikey': this.key,
                        'Authorization': `Bearer ${this.key}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                return response.json();
            }
            
            async insert(table, data) {
                const response = await fetch(`${this.url}/rest/v1/${table}`, {
                    method: 'POST',
                    headers: {
                        'apikey': this.key,
                        'Authorization': `Bearer ${this.key}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(data)
                });
                
                return response.json();
            }
        }
        
        // Initialize client
        const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Mock data for demo (before Supabase is configured)
        const mockProperties = [
            {
                id: 1,
                price: 450000,
                address: '123 Ocean View Drive',
                city: 'Seattle',
                state: 'WA',
                bedrooms: 3,
                bathrooms: 2.5,
                sqft: 2100,
                image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23667eea"/%3E%3C/svg%3E'
            },
            {
                id: 2,
                price: 625000,
                address: '456 Mountain Trail',
                city: 'Portland',
                state: 'OR',
                bedrooms: 4,
                bathrooms: 3,
                sqft: 2800,
                image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23764ba2"/%3E%3C/svg%3E'
            },
            {
                id: 3,
                price: 385000,
                address: '789 Downtown Plaza',
                city: 'Austin',
                state: 'TX',
                bedrooms: 2,
                bathrooms: 2,
                sqft: 1500,
                image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%2345b7d1"/%3E%3C/svg%3E'
            }
        ];
        
        // Render properties
        function renderProperties(properties) {
            const container = document.getElementById('propertiesContainer');
            container.innerHTML = '';
            
            properties.forEach(property => {
                const card = document.createElement('div');
                card.className = 'property-card';
                card.innerHTML = `
                    <div class="property-image" style="background-image: url('${property.image}'); background-size: cover;">
                        <span class="property-badge">For Sale</span>
                    </div>
                    <div class="property-info">
                        <div class="property-price">$${property.price.toLocaleString()}</div>
                        <div class="property-address">${property.address}, ${property.city}, ${property.state}</div>
                        <div class="property-features">
                            <span class="feature">🛏️ ${property.bedrooms} beds</span>
                            <span class="feature">🛁 ${property.bathrooms} baths</span>
                            <span class="feature">📐 ${property.sqft.toLocaleString()} sqft</span>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }
        
        // Load properties from Supabase (or mock data)
        async function loadProperties() {
            const loading = document.getElementById('loading');
            loading.style.display = 'block';
            
            try {
                // Try to load from Supabase
                if (SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL') {
                    const properties = await supabase.query('properties', {
                        select: '*',
                        limit: 50
                    });
                    renderProperties(properties);
                } else {
                    // Use mock data
                    setTimeout(() => {
                        renderProperties(mockProperties);
                    }, 500);
                }
            } catch (error) {
                console.error('Error loading properties:', error);
                renderProperties(mockProperties);
            } finally {
                loading.style.display = 'none';
            }
        }
        
        // Search functionality
        function searchProperties() {
            const query = document.getElementById('searchInput').value.toLowerCase();
            
            if (!query) {
                loadProperties();
                return;
            }
            
            const filtered = mockProperties.filter(p => 
                p.city.toLowerCase().includes(query) ||
                p.state.toLowerCase().includes(query) ||
                p.address.toLowerCase().includes(query)
            );
            
            renderProperties(filtered);
        }
        
        // Enter key support
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchProperties();
        });
        
        // Load properties on page load
        loadProperties();
        
        // Service Worker for offline support (optional)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('data:text/javascript,console.log("SW registered")')
                .catch(err => console.log('SW registration failed'));
        }
    </script>
</body>
</html>
```

**File size**: ~8KB (gzipped: ~3KB)  
**Dependencies**: 0  
**Works offline**: Yes (with mock data)  
**Can be emailed**: Yes!

---

## Backend Options for Single-File Apps

### Option A: Supabase (RECOMMENDED)

**What it is**: Open-source Firebase alternative with PostgreSQL database

**Free Tier:**
- ✅ 500MB database storage
- ✅ 1GB file storage
- ✅ 2GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ 500K Edge Function invocations/month
- ✅ Unlimited API requests

**Setup (5 minutes):**

```bash
# 1. Create account at https://supabase.com (free)
# 2. Create new project
# 3. Get your API keys from Settings → API

# 4. Create properties table via SQL Editor:
```

```sql
CREATE TABLE properties (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms NUMERIC NOT NULL,
  sqft INTEGER NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX idx_city ON properties(city);
CREATE INDEX idx_price ON properties(price);
CREATE INDEX idx_status ON properties(status);

-- Insert sample data
INSERT INTO properties (title, price, bedrooms, bathrooms, sqft, address, city, state, zip)
VALUES 
  ('Modern Downtown Loft', 450000, 2, 2, 1200, '123 Main St', 'Seattle', 'WA', '98101'),
  ('Suburban Family Home', 625000, 4, 3, 2800, '456 Oak Ave', 'Portland', 'OR', '97201'),
  ('Cozy Starter Home', 285000, 2, 1, 950, '789 Pine Rd', 'Austin', 'TX', '78701');
```

**JavaScript Integration:**

```javascript
// No npm install needed! Use their CDN
const SUPABASE_URL = 'https://xxxxxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGci...your_key_here';

// Fetch properties
async function getProperties(filters = {}) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/properties?select=*`, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
    });
    return response.json();
}

// Search by city
async function searchByCity(city) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/properties?city=ilike.*${city}*&select=*`, 
        {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        }
    );
    return response.json();
}
```

**Pros:**
- ✅ Real PostgreSQL database
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ File storage included
- ✅ Generous free tier
- ✅ Auto-generated REST API

**Cons:**
- ❌ Database pauses after 1 week of inactivity (free tier)
- ❌ Limited to 500MB storage

---

### Option B: PocketBase (Self-Hosted)

**What it is**: Single Go binary that provides database + auth + storage

**Cost**: $0 (self-hosted on AWS EC2 free tier)  
**File Size**: 12MB executable  
**Database**: SQLite (embedded)

**Setup:**

```bash
# 1. Download PocketBase
wget https://github.com/pocketbase/pocketbase/releases/download/v0.36.1/pocketbase_0.36.1_linux_amd64.zip
unzip pocketbase_0.36.1_linux_amd64.zip

# 2. Start server
./pocketbase serve

# 3. Visit http://127.0.0.1:8090/_/
# Create admin account via web UI
# Create "properties" collection with schema

# 4. Deploy to AWS EC2 (free tier eligible)
# - Launch t2.micro instance
# - Upload PocketBase binary
# - Run with systemd
# - Access via public IP
```

**JavaScript Integration:**

```javascript
// No dependencies needed!
const PB_URL = 'http://your-ec2-instance:8090';

async function getProperties() {
    const response = await fetch(`${PB_URL}/api/collections/properties/records`);
    return response.json();
}
```

**Pros:**
- ✅ Single binary, zero dependencies
- ✅ Built-in admin dashboard
- ✅ Real-time subscriptions
- ✅ Self-hosted = full control
- ✅ SQLite = portable database

**Cons:**
- ❌ Requires server (but EC2 free tier works)
- ❌ Not production-ready yet (v0.36)
- ❌ Less scalable than Postgres

---

### Option C: GitHub as Database (Creative!)

**What it is**: Use GitHub repository as a JSON database

**Cost**: $0  
**API Rate Limit**: 60 requests/hour (unauthenticated), 5000/hour (authenticated)

**Setup:**

```bash
# 1. Create data repository
mkdir home-harbor-data
cd home-harbor-data

# 2. Create data file
cat > properties.json << 'EOF'
[
  {
    "id": 1,
    "title": "Modern Loft",
    "price": 450000,
    "bedrooms": 2,
    "bathrooms": 2,
    "sqft": 1200,
    "city": "Seattle",
    "state": "WA"
  }
]
EOF

# 3. Push to GitHub
git init
git add properties.json
git commit -m "Initial data"
git remote add origin https://github.com/chf3198/home-harbor-data.git
git push -u origin main
```

**JavaScript Integration:**

```javascript
// Fetch directly from GitHub
async function getProperties() {
    const response = await fetch(
        'https://raw.githubusercontent.com/chf3198/home-harbor-data/main/properties.json'
    );
    return response.json();
}
```

**Pros:**
- ✅ Completely free
- ✅ Version-controlled data
- ✅ Simple REST API
- ✅ Global CDN (via raw.githubusercontent.com)

**Cons:**
- ❌ Read-only from browser (can't write without GitHub token)
- ❌ Rate limited
- ❌ Not suitable for user-generated content
- ❌ Manual updates required

**Best for**: Static data, demo/MVP, or read-only applications

---

## Complete Single-File + Supabase Example

Here's a production-ready architecture:

**File Structure:**
```
home-harbor/
├── index.html          (single file with everything)
└── README.md          (documentation)
```

**Deployment:**
```bash
# 1. Push to GitHub
git init
git add index.html
git commit -m "Deploy HomeHarbor"
git remote add origin https://github.com/chf3198/home-harbor.git
git push -u origin main

# 2. Enable GitHub Pages
# Settings → Pages → Source: main branch → Save

# 3. Done! Live at:
# https://chf3198.github.io/home-harbor/
```

**Backend Setup:**
```bash
# 1. Create Supabase project at https://supabase.com
# 2. Run SQL to create tables (see above)
# 3. Get API keys from Settings → API
# 4. Update index.html with your keys
# 5. Push changes
```

**Total Cost**: $0/month  
**Total Files**: 1  
**Total Dependencies**: 0  
**Setup Time**: 15 minutes  
**Can handle**: 10,000+ users/month on free tier

---

## Advanced: Making it Downloadable

Users can download and run the app locally:

**Add download button to your site:**

```html
<button onclick="downloadApp()">
    💾 Download App (Works Offline!)
</button>

<script>
function downloadApp() {
    // Get current HTML
    const html = document.documentElement.outerHTML;
    
    // Create blob
    const blob = new Blob([html], { type: 'text/html' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'homeharbor.html';
    a.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
}
</script>
```

Users can then:
1. Download `homeharbor.html`
2. Double-click to open in browser
3. Use fully offline (with cached data)

---

## Progressive Web App (PWA) Addition

Make it installable on mobile/desktop:

```html
<!-- Add to index.html -->
<link rel="manifest" href="data:application/json,{
    'name': 'HomeHarbor',
    'short_name': 'HomeHarbor',
    'start_url': '/',
    'display': 'standalone',
    'background_color': '#667eea',
    'theme_color': '#667eea',
    'icons': [{
        'src': 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ctext y=%2232%22 font-size=%2232%22%3E🏡%3C/text%3E%3C/svg%3E',
        'sizes': '512x512',
        'type': 'image/svg+xml'
    }]
}">

<script>
// Register service worker for offline support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('PWA ready!'));
}
</script>
```

Now users can "Add to Home Screen" on mobile!

---

## Performance Optimization

### Inline Images as Data URIs

```html
<!-- Instead of: -->
<img src="logo.png">

<!-- Use: -->
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...">
```

**Tool to convert images:**
```bash
# Install base64 (usually pre-installed)
base64 -i logo.png

# Or use online tool: https://www.base64-image.de/
```

### Code Minification

```bash
# Install minifier
npm install -g html-minifier-terser

# Minify
html-minifier-terser index.html \
  --collapse-whitespace \
  --remove-comments \
  --minify-css true \
  --minify-js true \
  -o index.min.html

# Result: 40-60% smaller file
```

---

## Cost Comparison: Single File vs. Traditional

**Single-File + GitHub Pages + Supabase:**
```
Hosting: $0
Database: $0
CDN: $0
SSL: $0
Total: $0/month (up to 50K users)
```

**Traditional Stack (T3 on Vercel):**
```
Vercel Pro: $20/month
Vercel Postgres: $10/month
Total: $30/month
```

**Traditional AWS (Original Design):**
```
ECS Fargate: $50/month
RDS: $30/month
ElastiCache: $15/month
Total: $95/month
```

**Savings: $95-360/year** 💰

---

## Real-World Examples

**Companies using single-file approach:**

1. **Photopea** - Full Photoshop alternative
   - Single-page app
   - 3MB bundle
   - Handles millions of users

2. **Excalidraw** - Collaborative whiteboard
   - Works offline
   - No backend needed (WebRTC for collaboration)
   - Installable PWA

3. **StackEdit** - Markdown editor
   - Single HTML file
   - Works completely offline
   - Syncs to GitHub/Google Drive

---

## Recommended Architecture for HomeHarbor

### Hybrid Approach (Best of Both Worlds)

```
┌─────────────────────────────────────┐
│   GitHub Pages (Free Hosting)       │
│   - index.html (single file)        │
│   - Global CDN                      │
│   - Free HTTPS                      │
│   - 99.9% uptime                    │
└──────────────┬──────────────────────┘
               │
               │ API Calls
               ▼
┌─────────────────────────────────────┐
│   Supabase (Free Backend)           │
│   - PostgreSQL database             │
│   - REST API (auto-generated)       │
│   - Authentication                  │
│   - File storage                    │
│   - Real-time updates               │
└─────────────────────────────────────┘
```

**Why this wins:**

1. **Zero cost** for MVP to 50K users
2. **Zero infrastructure** management
3. **Professional quality** with Postgres + Auth
4. **Instant deployment** via git push
5. **Global performance** via CDN
6. **Offline-capable** with service worker
7. **Downloadable** as single file
8. **Scalable** path to paid tiers

---

## Migration Path

### Phase 1: Single-File MVP (Week 1)
```bash
# Create index.html with inline styles/scripts
# Deploy to GitHub Pages
# Use mock data
# Cost: $0
```

### Phase 2: Add Supabase (Week 2)
```bash
# Create Supabase project
# Set up database schema
# Connect frontend to Supabase API
# Add authentication
# Cost: $0
```

### Phase 3: Add Features (Week 3-4)
```bash
# Add property search
# Add favorites functionality
# Add user profiles
# Add image uploads to Supabase Storage
# Cost: $0
```

### Phase 4: Scale (When needed)
```bash
# Upgrade Supabase to Pro ($25/month) for:
#   - No database pausing
#   - Daily backups
#   - More storage
# Or migrate to T3 Stack if you need custom backend
```

---

## Quick Start Commands

```bash
# 1. Create repository
git init home-harbor
cd home-harbor

# 2. Create single-file app
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>HomeHarbor</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: system-ui; margin: 2rem; }
        h1 { color: #667eea; }
    </style>
</head>
<body>
    <h1>🏡 HomeHarbor</h1>
    <p>Your real estate marketplace</p>
    <script>
        console.log('App loaded successfully!');
    </script>
</body>
</html>
EOF

# 3. Push to GitHub
git add index.html
git commit -m "Initial commit"
git remote add origin https://github.com/chf3198/home-harbor.git
git push -u origin main

# 4. Enable GitHub Pages (via web UI)
# Settings → Pages → Source: main → Save

# 5. Done! Visit:
# https://chf3198.github.io/home-harbor/
```

**Time to deployment: 5 minutes** ⚡

---

## Security Considerations

**Exposing API Keys:**

Supabase ANON key is safe to expose in frontend:
- ✅ It's designed for public use
- ✅ Row-Level Security (RLS) protects data
- ✅ Rate-limited by Supabase

**Enable Row-Level Security:**

```sql
-- Enable RLS on properties table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access" ON properties
    FOR SELECT
    USING (status = 'active');

-- Only authenticated users can insert
CREATE POLICY "Authenticated insert" ON properties
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
```

Now your data is protected even with public API keys!

---

## Final Recommendation

**For HomeHarbor MVP:**

✅ **Use**: Single HTML file + GitHub Pages + Supabase  
✅ **Cost**: $0/month  
✅ **Setup**: 30 minutes  
✅ **Scalability**: Up to 50K users on free tier  
✅ **Future**: Easy migration to T3 Stack if needed  

**This gives you:**
- Professional-looking UI
- Real database (PostgreSQL)
- User authentication
- File uploads
- Real-time updates
- Works offline
- Downloadable
- Zero infrastructure management

**Perfect for:**
- Portfolio projects
- MVPs
- Demos
- Side projects
- Learning

**Start here, scale later!** 🚀

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Pages](https://pages.github.com/)
- [PocketBase](https://pocketbase.io/docs/)
- [AWS S3 Static Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [JAMstack](https://jamstack.org/)
- [Data URI Generator](https://www.base64-image.de/)

---

**Last Updated**: January 31, 2026  
**Architecture**: Single-File Web App  
**Total Cost**: $0/month

