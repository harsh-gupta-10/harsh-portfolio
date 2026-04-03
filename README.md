# Harsh Portfolio & Admin CRM

A sophisticated, full-stack personal portfolio and client relationship management (CRM) system built with modern web technologies. This project features a stunning public-facing portfolio and a robust, feature-rich admin dashboard for managing projects, clients, invoices, and more.

## 🚀 Teck Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts & Data Viz**: [Recharts](https://recharts.org/)
- **Rich Text Editor**: [Tiptap](https://tiptap.dev/)
- **Collaborative Whiteboard**: [Fabric.js](http://fabricjs.com/)
- **PDF Generation**: [React-PDF](https://react-pdf.org/)

## ✨ Key Features

### Public Portfolio
- **Dynamic Sections**: Hero, About, Skills, Projects, Experience, Achievements, and Certificates.
- **Interactive Layers**: Custom parallax effects and scrolly-canvas animations.
- **Dark Mode**: Fully responsive and theme-aware design.
- **Contact System**: Live messaging and lead capture integrated with Supabase.

### Admin CRM Dashboard
- **Comprehensive Analytics**: Real-time project, message, and task monitoring.
- **Client Management**: Advanced CRM tools for tracking client interaction and details.
- **Invoicing System**: Professional invoice builder with real-time preview and PDF generation.
- **Proposal Builder**: Custom proposal builder for streamlined client onboarding.
- **Email Tracking**: Integrated pixel tracking for monitoring invoice and proposal views.
- **Collaborative Notes**: Rich-text notes with real-time synchronization.
- **Whiteboard**: Multi-user collaborative whiteboard powered by Fabric.js and Supabase Realtime.
- **Team & Permissions**: Robust role-based access control (RBAC) and team invitation system.
- **Security**: Protected admin routes and encrypted environment configuration.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Supabase account (for database, auth, and storage)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/harsh-gupta-10/harsh-portfolio.git
   cd harsh-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📜 Available Scripts

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the production bundle.
- `npm run lint`: Checks for linting errors.
- `npm run preview`: Locally previews the production build.

## 📄 License

This project is licensed under the MIT License.
