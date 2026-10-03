# Bloom Skills Suite

A comprehensive learning platform built with React, TypeScript, and Vite, designed to help users enhance their skills through interactive courses, progress tracking, and AI-powered assistance.

## 🚀 Features

- **Interactive Dashboard**: Track your learning progress with visual timelines and statistics
- **Course Catalog**: Browse and enroll in featured courses across various categories
- **AI Chatbot**: Get personalized learning assistance and support
- **Progress Tracking**: Monitor your journey with detailed progress indicators
- **Responsive Design**: Optimized for desktop and mobile devices
- **User Authentication**: Secure login and signup with Supabase
- **Payment Integration**: Seamless payment processing for premium courses

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN/UI** - Beautiful and accessible UI components
- **React Query** - Powerful data fetching and caching
- **React Router** - Client-side routing

### Backend & Database
- **Supabase** - Backend-as-a-Service for authentication, database, and real-time features
- **PostgreSQL** - Robust database via Supabase

### Development Tools
- **ESLint** - Code linting
- **Vitest** - Unit testing
- **Playwright** - End-to-end testing
- **PostCSS** - CSS processing

## 📁 Project Structure

```
bloom-skills-suite/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # ShadCN UI components
│   │   ├── dashboard/     # Dashboard-specific components
│   │   ├── home/          # Homepage components
│   │   └── layout/        # Layout components (Navbar, Footer)
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts (Auth)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── integrations/      # Third-party integrations
│   └── assets/            # Static assets
├── supabase/              # Supabase configuration and migrations
└── test/                  # Test files
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bloom-skills-suite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Create a `.env` file in the project root
   - Add your backend URL and any other required env variables
   ```env
   VITE_API_BASE=https://slateserver1.onrender.com
   # Optional legacy Supabase variables if still needed by old code paths
   # VITE_SUPABASE_URL=your_supabase_url
   # VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5500`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

## 🧪 Testing

The project includes both unit tests (Vitest) and end-to-end tests (Playwright).

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npx playwright test
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service like Vercel, Netlify, or GitHub Pages.

### Environment Variables for Production

Make sure to set the following environment variable in your deployment platform:

- `VITE_API_BASE`

If your deployment still relies on legacy Supabase code, also add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@bloomskillssuite.com or join our Discord community.

## 🙏 Acknowledgments

- [ShadCN](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vite](https://vitejs.dev/) for the fast development experience




primary -color:text-[#0037FF]
secondary -color:text-[#4a6ff7]


GOOGLE_DRIVE_CLIENT_ID
GOOGLE_DRIVE_CLIENT_SECRET
GOOGLE_DRIVE_REFRESH_TOKEN
GOOGLE_DRIVE_FOLDER_ID