# Chinese Leadership Explorer

A modern web application for exploring and visualizing Chinese leadership structures and hierarchies. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Interactive visualization of leadership hierarchies
- Detailed leader profiles and information
- Modern, responsive UI with dark/light theme support
- Real-time data updates
- PostgreSQL database integration

## Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Database**: PostgreSQL
- **State Management**: React Hooks
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Date Handling**: date-fns

## Prerequisites

- Node.js (Latest LTS version recommended)
- PostgreSQL
- pnpm (Package manager)

## Getting Started

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd chinese-leadership-explorer
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   ├── body-hierarchy.tsx
│   ├── leader-card.tsx
│   └── leadership-explorer.tsx
├── hooks/             # Custom React hooks
├── lib/              # Utility functions and configurations
├── public/           # Static assets
└── styles/           # Additional styles
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/) 