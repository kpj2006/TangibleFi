# 🛠️ TangibleFi Development Guide

**Quick Reference for Developers**

## 🚀 Getting Started (Step by Step)

### Step 1: Prerequisites

```bash
# Check your versions
node --version  # Should be 18.17.0+
npm --version   # Should be 9.0.0+
git --version   # Should be 2.30.0+
```

### Step 2: Project Setup

```bash
# Clone the repository
git clone <your-repository-url>
cd rwa-main

# Install dependencies
npm install

# Copy environment template
cp env.example .env.local
```

### Step 3: Environment Configuration

Edit `.env.local` with your credentials:
 
```bash
# Required: Get from https://supabase.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: For IPFS storage (https://pinata.cloud)
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret
```

### Step 4: Start Development

```bash
# Start the development server
npm run dev

# Open your browser
# Navigate to http://localhost:3000
```

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Check code quality
npm run lint:fix        # Fix linting issues
npm run type-check      # TypeScript checking

# Testing
npm run test            # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage
```

## 📁 Key Directories

```
src/
├── app/                 # Next.js 15 App Router
│   ├── (auth)/         # Authentication pages
│   ├── admin/          # Admin dashboard
│   ├── api/            # API endpoints
│   └── dashboard/      # Main application
├── components/         # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── web3/          # Blockchain utilities
│   └── admin/         # Admin services
└── types/             # TypeScript definitions
```

## 🔗 Important Files

- **`middleware.ts`**: Route protection and authentication
- **`next.config.js`**: Next.js configuration with CORS
- **`tailwind.config.ts`**: Styling configuration
- **`supabase/client.ts`**: Database client setup

## 🐛 Common Issues & Solutions

### Issue: Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Issue: Environment Variables Not Loading

```bash
# Check file name (should be .env.local)
# Restart development server after changes
npm run dev
```

### Issue: Database Connection

```bash
# Verify Supabase credentials in .env.local
# Check Supabase project status
# Ensure RLS policies are configured
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

### Manual Build

```bash
# Build the project
npm run build

# Start production server
npm run start
```

## 🔐 Security Checklist

- [ ] Never commit `.env.local` to git
- [ ] Use different keys for dev/staging/production
- [ ] Enable 2FA on all service accounts
- [ ] Configure CORS properly for production
- [ ] Set up proper RLS policies in Supabase
- [ ] Use HTTPS in production

## 📊 Performance Tips

- Use `npm run build` to check bundle size
- Monitor Lighthouse scores
- Optimize images and assets
- Use proper caching strategies
- Monitor API rate limits

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test: `npm run test && npm run build`
3. Commit: `git commit -m "feat: your feature"`
4. Push and create PR

## 📞 Need Help?

- Check the main `README.md` for comprehensive documentation
- Review `COMPLETE_PROJECT_GUIDE.md` for detailed architecture
- Create GitHub issues for bugs
- Check console logs for error details

---

**Happy Coding! 🚀**
