'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import axios from "axios"
import { toast } from '@/hooks/use-toast'

export default function Page() {
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
      username: { value: string }
      name: { value: string }
    }

    const username = target.username.value
    const email = target.email.value
    const password = target.password.value
    const name = target.name.value

    try {
      const result = await axios.post('http://localhost:3000/api/auth/signup', {
        username, // Directly pass the fields instead of wrapping in body
        email,
        password,
        name,
      });

      if (result.status === 201) {
        // Redirect on successful signup
        signIn("credentials",{
          Email:email,Password:password,redirect:false,
          callbackUrl: '/'
        })
        router.push("/");
      } else {
        // Handle errors if any
        toast({
          title: result.data.msg || result.data.msg[0].message || 'Signup failed' as string,
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: 'An error occurred during signup',
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-semibold">Sign Up</h3>
          <p className="text-sm text-gray-500">
            Create an account with your email and password
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 sm:px-16">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="kickflip"
              required
            />
          </div>
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Rodney Mullen"
              required
            />
          </div>
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
            <Icons.userPlus className="mr-2 h-4 w-4" />
            Sign Up
          </Button>
          <Button variant="outline" onClick={() => signIn('google')}>
            <Icons.google className="mr-2 h-4 w-4" />
            Sign Up with Google
          </Button>
          <Button variant="outline" onClick={() => signIn('github')}>
            <Icons.gitHub className="mr-2 h-4 w-4" />
            Sign Up with GitHub
          </Button>
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/signin" className="font-semibold text-gray-800">
              Sign in
            </Link>{' '}
            instead.
          </p>
        </form>
      </div>
    </div>
  )
}
