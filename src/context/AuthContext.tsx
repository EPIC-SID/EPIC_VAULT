import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile, AuthContextType } from '@/types'

const AuthContext = createContext<AuthContextType | null>(null)

// Dedicated Admin Emails for instantaneous access
const ADMIN_EMAILS = ['epicsid6@gmail.com', 'admin@epicvault.com']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (u: User) => {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .maybeSingle()

      if (!data && u.email) {
        const fallback = await supabase
          .from('profiles')
          .select('*')
          .eq('email', u.email)
          .maybeSingle()

        if (fallback.data) {
          data = fallback.data
        }
      }

      if (error) {
        console.error('[AuthContext] Profile fetch error:', error.message)
      }

      const isDesignatedAdmin = u.email ? ADMIN_EMAILS.includes(u.email.toLowerCase()) : false
      const assignedRole = (data?.role === 'admin' || isDesignatedAdmin) ? 'admin' : (data?.role || 'customer')

      if (data) {
        setProfile({
          ...(data as Profile),
          role: assignedRole
        })
      } else {
        setProfile({
          id: u.id,
          name: (u.user_metadata?.name as string) || u.email?.split('@')[0] || 'User',
          email: u.email || '',
          role: assignedRole,
          avatar_url: null,
          created_at: u.created_at,
          updated_at: u.created_at,
        })
      }
    } catch (err) {
      console.error('[AuthContext] Unexpected error during profile fetch:', err)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user)
        }
      } catch (err) {
        console.error('[AuthContext] Session init error:', err)
      } finally {
        setLoading(false)
      }
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signUp = async ({
    name,
    email,
    password,
  }: {
    name: string
    email: string
    password: string
  }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
  }

  const signIn = async ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
  }

  const isAdmin = profile?.role === 'admin' || (user?.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false)

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, isAdmin, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
