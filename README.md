# GatorEx - University of Florida Student Marketplace

A secure, verified marketplace exclusively for University of Florida students to buy, sell, and trade items within the campus community. Built with enterprise-level architecture supporting real-time interactions, comprehensive analytics, and advanced user management.

## 🚀 **Core Features**

### **🔐 Authentication & Security**
- **UF Email Verification**: Exclusive access for verified UF students
- **Multi-factor Authentication**: Google OAuth + OTP verification system
- **Privacy Controls**: Two-step contact detail access with authentication gates
- **Terms & Privacy Compliance**: Legal compliance with database tracking
- **Rate Limiting**: OTP attempts and daily listing limits with security monitoring

### **📱 Marketplace Platform**
- **Advanced Listing Management**: Full CRUD with status workflow (Draft → Published → Expired/Sold)
- **Enhanced Photo Carousel**: Multi-input navigation (click, keyboard, swipe, dots) with accessibility
- **Real-time Favorites System**: Instant sync across components with larger heart icons (24-28px)
- **Contact Analytics**: Comprehensive interaction tracking and seller insights
- **Mobile-First Design**: Progressive Web App with touch optimizations

### **💬 Communication & Tracking**
- **Contact Event System**: Track all user interactions (email, SMS, phone, views)
- **Seller Analytics Dashboard**: View who contacted you with interaction history
- **WhatsApp Integration**: AI-powered bot for automated responses
- **Real-time Notifications**: Instant updates for favorites, contacts, and status changes

### **🎯 Advanced User Management**
- **Trust System**: User trust scores (capped at 100), verification badges, and reputation tracking
- **Profile Management**: Current & past listings with action buttons
- **Giveaway System**: Contest management with Instagram verification
- **Usage Analytics**: View tracking, engagement metrics, and performance insights

## 🏗️ **Technical Architecture**

### **Frontend Stack**
- **Framework**: Next.js 14 with React 18 and TypeScript
- **Styling**: Tailwind CSS with responsive design system
- **State Management**: React Hooks with optimistic UI updates
- **Performance**: Code splitting, lazy loading, and image optimization
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### **Backend Infrastructure**
- **API Architecture**: RESTful APIs with Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM and connection pooling
- **Authentication**: NextAuth.js with custom UF verification flow
- **File Storage**: Cloudinary integration with optimized image handling
- **Email System**: Nodemailer with Gmail SMTP and template engine

### **Database Schema**
```sql
-- Core Models
Users (auth, profiles, trust scores, terms acceptance)
Listings (CRUD, status management, view tracking)
Images (Cloudinary integration, lazy loading)
Favorites (many-to-many relationships, real-time sync)
ContactEvents (interaction tracking, analytics)
Giveaways (contest management, verification)
```

## 📊 **API Documentation**

### **Authentication Endpoints**
```bash
POST /api/auth/send-otp          # OTP generation & email sending
POST /api/auth/verify-otp        # OTP verification with rate limiting
POST /api/auth/complete-profile  # Profile completion workflow
GET  /api/auth/[...nextauth]     # NextAuth OAuth handlers
```

### **Listing Management**
```bash
GET    /api/listings             # Paginated listings with advanced filters
GET    /api/listings/[id]        # Individual listing with view tracking
POST   /api/listings/[id]/view   # Automatic view counting
GET    /api/listings/[id]/contact # Protected contact details (auth required)
POST   /api/listings/[id]/mark-sold # Status update with timestamp
```

### **Favorites System**
```bash
GET    /api/favorites            # User's favorited listings
POST   /api/favorites            # Toggle favorite with real-time sync
POST   /api/favorites/check      # Batch favorite status checking
```

### **Contact Analytics**
```bash
POST   /api/listings/[id]/contact-event  # Log contact interactions
GET    /api/listings/[id]/contacts       # Seller analytics dashboard
```

### **Publishing & Media**
```bash
POST   /api/sell/draft          # Save draft with validation
POST   /api/sell/publish        # Publish with image processing
POST   /api/upload/images       # Cloudinary upload with optimization
```

## 🛠️ **Setup & Installation**

### **Prerequisites**
- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Google OAuth credentials
- Cloudinary account
- Gmail account with app password

### **Quick Start**
```bash
# Clone and install
git clone https://github.com/yourusername/gatorex.git
cd gatorex
npm install

# Environment setup
cp .env.example .env.local
# Fill in your environment variables (see below)

# Database setup
npx prisma generate
npx prisma db push
node scripts/migrate-favorites.js
node scripts/migrate-listing-updates.js

# Development server
npm run dev
```

### **Environment Variables**
```env
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Media Storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email System
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# WhatsApp (Optional)
WHATSAPP_TOKEN="your-whatsapp-token"
WHATSAPP_PHONE_ID="your-phone-id"
```

## 📁 **Project Structure**

```
gatorex/
├── pages/                    # Next.js pages & API routes
│   ├── api/                 # RESTful API endpoints
│   │   ├── auth/           # Authentication system
│   │   ├── listings/       # Listing management
│   │   ├── favorites/      # Favorites system
│   │   └── user/           # User management
│   ├── listing/[id]/       # Dynamic listing pages
│   ├── favorites.tsx       # Favorites page
│   ├── me.tsx             # Profile management
│   └── ...                # Core application pages
├── src/
│   ├── components/         # React component library
│   │   ├── ui/            # Reusable UI components
│   │   ├── navigation/    # Navigation systems
│   │   └── sell/          # Selling workflow
│   ├── lib/               # Utility functions
│   │   ├── auth/          # Authentication helpers
│   │   ├── db/            # Database utilities
│   │   └── whatsapp/      # WhatsApp integration
│   └── styles/            # Global styles
├── prisma/                # Database schema & migrations
├── scripts/               # Utility & migration scripts
└── public/                # Static assets
```

## � **Deveblopment Scripts**

```bash
# Development
npm run dev              # Start development server
npm run build           # Production build
npm run start           # Production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:migrate      # Run migrations

# Testing
npm run test            # Run test suite
npm run lint            # Code linting
npm run type-check      # TypeScript checking
```

## 📈 **Performance Features**

### **Frontend Optimizations**
- **Code Splitting**: Dynamic imports and lazy loading
- **Image Optimization**: WebP format, responsive sizing, CDN delivery
- **Caching Strategy**: API response caching, static asset optimization
- **Bundle Analysis**: Tree shaking, minification, and performance monitoring

### **Backend Performance**
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **API Pagination**: Cursor-based pagination for large datasets
- **Real-time Updates**: WebSocket integration for live features

## 🔒 **Security Features**

### **Data Protection**
- **Input Validation**: Server-side validation for all endpoints
- **SQL Injection Prevention**: Parameterized queries with Prisma
- **XSS Protection**: Content Security Policy and input sanitization
- **Rate Limiting**: API throttling and abuse prevention

### **Privacy Compliance**
- **GDPR Considerations**: User data control and deletion capabilities
- **Audit Trail**: Complete interaction logging for transparency
- **Contact Privacy**: Multi-step authentication for sensitive data
- **Terms Tracking**: Legal compliance with timestamp verification

## 🚀 **Deployment**

### **Production Deployment**
```bash
# Build optimization
npm run build

# Environment setup
cp .env.production .env

# Database migration
node scripts/setup-production.js

# Deploy to Vercel
vercel --prod
```

### **Scaling Considerations**
- **Horizontal Scaling**: Stateless architecture for multi-instance deployment
- **CDN Integration**: Global asset distribution with Cloudinary
- **Database Scaling**: Read replicas and connection pooling
- **Monitoring**: Error tracking with Sentry and performance metrics

## 🤝 **Contributing**

### **Development Workflow**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow TypeScript and ESLint guidelines
4. Add tests for new features
5. Update documentation
6. Submit pull request with detailed description

### **Code Standards**
- **TypeScript**: Full type safety across application
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automated code formatting
- **Conventional Commits**: Standardized commit messages

## 📊 **Analytics & Monitoring**

### **Built-in Analytics**
- **User Engagement**: Profile completion, verification rates
- **Listing Performance**: Views, contacts, conversion tracking
- **Popular Categories**: Trending items and search patterns
- **Contact Analytics**: Interaction success rates and patterns

### **Performance Monitoring**
- **Real-time Metrics**: API response times and error rates
- **Database Performance**: Query optimization and connection monitoring
- **User Experience**: Core Web Vitals and loading performance
- **Security Monitoring**: Failed authentication attempts and suspicious activity

## 📞 **Support & Community**

- **Documentation**: Comprehensive guides and API references
- **Issue Tracking**: GitHub Issues for bug reports and feature requests
- **Community**: Discord server for developers and users
- **Email Support**: technical@gatorex.com for enterprise inquiries

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the University of Florida community**

*GatorEx represents a production-ready marketplace platform with enterprise-level features, security, and scalability. The architecture supports thousands of concurrent users with real-time interactions and comprehensive analytics.*
