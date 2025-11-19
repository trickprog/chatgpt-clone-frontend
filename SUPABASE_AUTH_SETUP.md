# ChatGPT Clone Frontend - Supabase Auth Setup

## 🎯 Supabase Auth Integration

This frontend uses Supabase Authentication for user management.

## 📦 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase Auth

#### Enable Email/Password Auth in Supabase:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Enable **Email** provider
5. Configure email templates (optional)

#### Update Users Table Schema:

Since we're using Supabase Auth, we need to adjust our users table to work with Auth:

```sql
-- Drop existing users table if it exists
DROP TABLE IF EXISTS users CASCADE;

-- The users table will sync with Supabase Auth
-- Auth users are stored in auth.users
-- We create a public.users table for additional user data

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update conversations table to use auth.users
ALTER TABLE conversations 
  DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;

ALTER TABLE conversations
  ADD CONSTRAINT conversations_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- RLS Policies (updated for auth.users)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### 3. Environment Variables

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Get these from: **Supabase Dashboard** → **Settings** → **API**

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication Flow

### Sign Up:
1. User enters email, password, and name
2. Supabase creates user in `auth.users`
3. Trigger automatically creates profile in `public.users`
4. User is logged in and redirected to `/chat`

### Sign In:
1. User enters email and password
2. Supabase validates credentials
3. Session is created
4. User is redirected to `/chat`

### Protected Routes:
- `/chat` - Requires authentication
- Automatically redirects to `/login` if not authenticated

## 📁 Project Structure

```
app/
├── login/
│   └── page.tsx              # Login page
├── signup/
│   └── page.tsx              # Signup page
├── chat/
│   └── page.tsx              # Protected chat page
└── layout.tsx                # Root layout with AuthProvider

components/
├── auth/
│   ├── login-form.tsx        # Login form with Supabase
│   └── signup-form.tsx       # Signup form with Supabase
└── ProtectedRoute.tsx        # Route protection wrapper

contexts/
└── AuthContext.tsx           # Auth state management

lib/
└── supabase.ts               # Supabase client
```

## 🎨 Features

- ✅ Email/Password Authentication
- ✅ Protected Routes
- ✅ Auth State Management
- ✅ Auto-redirect on login/logout
- ✅ Loading states
- ✅ Error handling
- ✅ Session persistence

## 🧪 Testing

### Test Signup:
1. Go to `/signup`
2. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Signup"
4. Should redirect to `/chat`

### Test Login:
1. Go to `/login`
2. Enter credentials
3. Click "Login"
4. Should redirect to `/chat`

### Test Protected Route:
1. Logout (if logged in)
2. Try to visit `/chat`
3. Should redirect to `/login`

## 🔧 Backend Integration

The backend is **no longer needed** for authentication since we're using Supabase Auth directly.

However, you can still use the backend for:
- AI chat functionality
- Additional business logic
- Custom API endpoints

To connect to the backend API, update the fetch calls in your components to point to your backend URL.

## 📝 Auth Context API

```typescript
const { user, session, loading, signUp, signIn, signOut } = useAuth();

// Sign up
await signUp(email, password, name);

// Sign in
await signIn(email, password);

// Sign out
await signOut();

// Check auth state
if (user) {
  console.log('User is logged in:', user.email);
}
```

## 🔒 Security Notes

- Passwords are hashed by Supabase
- Sessions use JWT tokens
- Row Level Security (RLS) enabled
- HTTPS required in production
- Environment variables for sensitive data

## 🚀 Production Deployment

1. Update Supabase URL in production env
2. Configure email templates
3. Set up custom domain
4. Enable email confirmations (optional)
5. Configure password reset flow

## 📚 Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js Auth Guide](https://nextjs.org/docs/authentication)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Troubleshooting

### "Invalid login credentials"
- Check email/password are correct
- Verify user exists in Supabase Auth

### "User not authorized"
- Check RLS policies
- Verify auth token is valid

### Session not persisting
- Check localStorage
- Verify Supabase URL/Key

### Redirect loop
- Check ProtectedRoute logic
- Verify auth state updates

## License

ISC
