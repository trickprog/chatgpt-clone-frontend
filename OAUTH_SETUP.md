# OAuth Setup Guide - Google & GitHub

## 🎯 Overview

This guide will help you set up Google and GitHub OAuth authentication with Supabase.

## 📋 Prerequisites

- Supabase project created
- Frontend running on `http://localhost:3000`

---

## 🔵 Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name: "ChatGPT Clone"
4. Click **Create**

### Step 2: Configure OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for testing)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: ChatGPT Clone
   - **User support email**: your-email@example.com
   - **Developer contact**: your-email@example.com
5. Click **Save and Continue**
6. Skip **Scopes** (click Save and Continue)
7. Add test users (your email)
8. Click **Save and Continue**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Fill in:
   - **Name**: ChatGPT Clone Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `https://xbsxogyagxufaubsmsuh.supabase.co/auth/v1/callback`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### Step 4: Configure in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** and click to expand
5. Enable **Google**
6. Paste your **Client ID** and **Client Secret**
7. Click **Save**

---

## ⚫ GitHub OAuth Setup

### Step 1: Create OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name**: ChatGPT Clone
   - **Homepage URL**: `http://localhost:3000`
   - **Application description**: AI Chat Application
   - **Authorization callback URL**: `https://xbsxogyagxufaubsmsuh.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret**
7. Copy the **Client Secret** (you won't see it again!)

### Step 2: Configure in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **GitHub** and click to expand
5. Enable **GitHub**
6. Paste your **Client ID** and **Client Secret**
7. Click **Save**

---

## 🧪 Testing OAuth

### Test Google Login:

1. Run your app: `npm run dev`
2. Go to `http://localhost:3000/login`
3. Click **Continue with Google**
4. Select your Google account
5. Should redirect to `/chat` after successful login

### Test GitHub Login:

1. Go to `http://localhost:3000/login`
2. Click **Continue with GitHub**
3. Authorize the application
4. Should redirect to `/chat` after successful login

---

## 🔧 Troubleshooting

### "redirect_uri_mismatch" Error

**Problem**: The redirect URI doesn't match what's configured.

**Solution**:
- Make sure the Supabase callback URL is exactly:
  ```
  https://xbsxogyagxufaubsmsuh.supabase.co/auth/v1/callback
  ```
- Check for trailing slashes
- Wait a few minutes for changes to propagate

### "Access Blocked" Error (Google)

**Problem**: App is not verified for production use.

**Solution**:
- Add your email as a test user in OAuth consent screen
- For production, submit for verification

### GitHub OAuth Not Working

**Problem**: Authorization fails silently.

**Solution**:
- Verify Client ID and Secret are correct
- Check callback URL matches Supabase exactly
- Try generating a new client secret

### Users Not Saving to Database

**Problem**: OAuth users authenticate but no profile created.

**Solution**: Run this SQL in Supabase to create a trigger:

```sql
-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 🚀 Production Deployment

### Update Redirect URLs

When deploying to production, update the redirect URLs:

**Google Cloud Console**:
- Add: `https://your-domain.com`
- Add: `https://your-supabase-project.supabase.co/auth/v1/callback`

**GitHub OAuth App**:
- Update Homepage URL: `https://your-domain.com`
- Keep callback: `https://your-supabase-project.supabase.co/auth/v1/callback`

**Environment Variables**:
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Guide](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)

---

## ✅ Checklist

### Google OAuth:
- [ ] Created Google Cloud project
- [ ] Configured OAuth consent screen
- [ ] Created OAuth credentials
- [ ] Added redirect URI to Google Console
- [ ] Enabled Google provider in Supabase
- [ ] Tested login flow

### GitHub OAuth:
- [ ] Created OAuth App on GitHub
- [ ] Got Client ID and Secret
- [ ] Added callback URL
- [ ] Enabled GitHub provider in Supabase
- [ ] Tested login flow

### Database:
- [ ] Created users table
- [ ] Set up trigger for new users
- [ ] Tested user creation on OAuth login

---

## 🎉 Done!

Your OAuth authentication should now be working! Users can sign in with:
- ✅ Email/Password
- ✅ Google
- ✅ GitHub
