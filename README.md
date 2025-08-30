# GatorEx - UF Student Marketplace

A production-ready Next.js 14 application for University of Florida students to buy and sell items within the campus community.

## 🚀 Features

- **Student Verification**: UF email verification ensures a trusted community
- **Secure Marketplace**: Buy and sell textbooks, furniture, electronics, and more
- **Direct Communication**: WhatsApp integration for seamless seller-buyer communication
- **Mobile-First Design**: Optimized for mobile devices with responsive UI
- **Category Browsing**: Easy navigation through different item categories
- **User Profiles**: Seller ratings and verification badges for trust
- **Static Export**: Optimized for deployment to any static hosting service
- **SEO Optimized**: Proper meta tags and structured data
- **PWA Ready**: Manifest file and mobile app capabilities

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom UF branding
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Build**: Static export for universal deployment

## 📦 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gatorex-mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
├── pages/                  # Next.js pages
│   ├── _app.tsx           # App wrapper with global styles
│   ├── _document.tsx      # HTML document structure
│   └── index.tsx          # Main application page
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components (Radix-based)
│   │   └── figma/        # Custom components
│   └── styles/           # Global CSS and Tailwind config
├── public/               # Static assets
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run export` - Build and export static files

## 🚀 Deployment

This app is configured for static export and can be deployed to:

- **Vercel**: `vercel --prod`
- **Netlify**: Deploy the `out` folder after `npm run export`
- **GitHub Pages**: Deploy the `out` folder
- **Any static hosting**: Upload the `out` folder contents

## 🎨 Customization

### UF Branding
The app includes custom UF colors and gradients:
- `--uf-orange`: #FF7A00
- `--uf-blue`: #0021FF
- Custom gradients and utility classes

### Tailwind Configuration
Extend the theme in `tailwind.config.js` for additional customizations.

## 🔧 Key Features Implemented

### ✅ Next.js 14 Setup
- Static export configuration
- Proper TypeScript setup
- ESLint configuration

### ✅ UI Components
- All Radix UI imports fixed (removed version numbers)
- Proper "use client" directives added
- Tailwind CSS integration

### ✅ Mobile Optimization
- Responsive design
- Touch-friendly interactions
- PWA manifest

### ✅ SEO & Performance
- Meta tags and Open Graph
- Optimized images
- Static generation

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all imports are correct and "use client" is added to components using hooks
2. **Styling Issues**: Check Tailwind CSS is properly configured
3. **Static Export**: Verify no server-side features are used in static export mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎓 University of Florida

Built with 🐊 pride for the Gator community!

---
