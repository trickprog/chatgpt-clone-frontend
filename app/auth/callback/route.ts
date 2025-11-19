import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/login?error=${error.message}`)
    }

    // If we have a user, ensure they exist in the users table
    if (data.user) {
      try {
        // Try to insert the user record (will fail silently if already exists)
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || 
                  data.user.user_metadata?.full_name || 
                  data.user.email?.split('@')[0] || 
                  'User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        // Ignore duplicate key errors (23505) - user already exists
        if (dbError && dbError.code !== '23505') {
          console.error('Error creating user record:', dbError)
        }
      } catch (err) {
        console.error('Error handling user record:', err)
        // Don't fail the login - continue to chat
      }
    }
  }

  // Redirect to chat after successful authentication
  return NextResponse.redirect(`${origin}/chat`)
}
