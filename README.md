# GamePlan

GamePlan is an event management application where users can create, view, and manage events.

## Tech Stack

- **Next.js 15+** with App Router
- **TypeScript**
- **Supabase** for database and authentication
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **Netlify** for deployment

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gameplan
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (optional, for server-side operations)
- `NEXT_PUBLIC_SITE_URL`: Your site URL (required for OAuth callbacks). For development, use `http://localhost:3000`. For production, use your production URL (e.g., `https://yourdomain.com`)

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
gameplan/
├── app/                    # Next.js App Router pages and layouts
│   ├── actions/           # Server actions
│   │   └── auth.ts       # Authentication server actions
│   ├── auth/             # Authentication routes
│   │   └── callback/     # OAuth callback route
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── auth/            # Authentication components
│   │   ├── login-form.tsx
│   │   └── logout-button.tsx
│   └── ui/              # Shadcn/ui components
├── lib/                 # Utility functions and configurations
│   ├── supabase/        # Supabase client utilities
│   └── utils.ts         # General utilities
├── public/              # Static assets
└── middleware.ts        # Next.js middleware for auth
```

## Authentication

The application uses Supabase Authentication with the following features:

- **Email/Password Authentication**: Users can sign up and sign in with email and password
- **Google OAuth**: Users can sign in with their Google account
- **Protected Routes**: All routes are protected by default. Unauthenticated users are redirected to the login page
- **Session Management**: Sessions are managed server-side using Supabase SSR helpers
- **Automatic Redirects**: After login, users are redirected to their intended destination or the home page

### Setting up Google OAuth

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Add your Google OAuth credentials (Client ID and Client Secret)
5. Add your callback URL to the allowed redirect URLs: `https://yourdomain.com/auth/callback` (or `http://localhost:3000/auth/callback` for development)
6. Make sure `NEXT_PUBLIC_SITE_URL` is set in your environment variables

## Development

### Adding Shadcn/ui Components

To add a new Shadcn/ui component:

```bash
npx shadcn@latest add [component-name]
```

### Database Setup

1. Create your Supabase project at [supabase.com](https://supabase.com)
2. Set up your database schema
3. Configure Row Level Security (RLS) policies
4. Update environment variables with your Supabase credentials

## Deployment

This project is configured for deployment on Netlify. Make sure to:

1. Set environment variables in Netlify dashboard
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

