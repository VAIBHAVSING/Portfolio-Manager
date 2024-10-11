'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { signinSchema } from '@/lib/Validator/siginSchema'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()
  if(status==="authenticated"){
    redirect('/');
  }

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setLoading(true)

    const target = event.target as typeof event.target & {
      email: { value: string }
      password: { value: string }
    }
    const formData = {
        email: target.email.value,
        password: target.password.value,
      };      
    const isvalid=signinSchema.safeParse(formData);
    if(!isvalid.success){
        
        console.log(isvalid.error)
        // return ;
    }
    const result = await signIn('credentials', {
      Email: target.email.value,
      Password: target.password.value,
      redirect:true,
      callbackUrl: '/',
    })

    setLoading(false)

    if (result?.error) {
      console.error(result.error)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-semibold">Sign In</h3>
          <p className="text-sm text-gray-500">
            Use your email and password to sign in
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 sm:px-16">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="rodneymullen@gmail.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          <Button disabled={loading}>
            {loading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Icons.logIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
          <Button variant="outline" onClick={() => signIn('google')}>
            <Icons.google className="mr-2 h-4 w-4" />
            Sign In with Google
          </Button>
          <Button variant="outline" onClick={() => signIn('github')}>
            <Icons.gitHub className="mr-2 h-4 w-4" />
            Sign In with GitHub
          </Button>
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-gray-800">
              Sign up
            </Link>{' '}
            for free.
          </p>
        </form>
      </div>
    </div>
  )
}