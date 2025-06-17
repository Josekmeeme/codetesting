{
  "name": "smartkidstories",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "prepare": "husky install"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.38.1",
    "axios": "^1.6.7",
    "clsx": "^2.1.0",
    "jsonwebtoken": "^9.0.2",
    "next": "^14.1.4",
    "openai": "^4.38.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-icons": "^5.2.0",
    "uuid": "^9.0.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.2",
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.36",
    "@types/react-dom": "^18.2.15",
    "eslint": "^8.55.0",
    "eslint-config-next": "^14.1.4",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "prettier": "^3.2.5",
    "typescript": "^5.4.2"
  },
  "lint-staged": {
    "**/*.{js,ts,tsx}": "prettier --write"
  }
} 
