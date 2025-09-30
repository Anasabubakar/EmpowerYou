'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';

import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');


const signUpSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;
type SignInFormValues = z.infer<typeof signInSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sign-in');

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const handleSignUp: SubmitHandler<SignUpFormValues> = async (data) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      await updateProfile(userCredential.user, { displayName: data.name });
      
      await sendEmailVerification(userCredential.user);

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        userName: data.name,
        email: data.email,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Verification Email Sent',
        description: 'Please check your inbox and verify your email address to complete sign-up.',
        duration: 10000,
      });
      setActiveTab('sign-in');
      signUpForm.reset();
    } catch (error: any) {
      toast({
        title: 'Sign Up Failed',
        description:
          error.code === 'auth/email-already-in-use'
            ? 'This email is already registered. Please sign in.'
            : error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn: SubmitHandler<SignInFormValues> = async (data) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      if (!userCredential.user.emailVerified) {
         toast({
          title: 'Email Not Verified',
          description: 'Please verify your email address before signing in. We can send the link again if you need.',
          variant: 'destructive',
          action: (
             <Button
              variant="secondary"
              onClick={async () => {
                try {
                  await sendEmailVerification(userCredential.user);
                  toast({
                    title: 'Verification Email Sent',
                    description: 'Please check your inbox.',
                  });
                } catch (error) {
                  toast({
                    title: 'Error',
                    description: 'Failed to send verification email. Please try again later.',
                    variant: 'destructive',
                  });
                }
              }}
            >
              Resend Email
            </Button>
          ),
          duration: 10000,
        });
        await auth.signOut(); // Ensure user is not partially logged in
        setLoading(false);
        return;
      }
      
      toast({
        title: 'Welcome Back!',
        description: "You've successfully signed in.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Sign In Failed',
        description: 'Please check your email and password.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset: SubmitHandler<ForgotPasswordFormValues> = async (
    data
  ) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your inbox for a link to reset your password.',
      });
      setActiveTab('sign-in');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Could not send password reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto">
            <AppLogo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to Your Sanctuary
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue or create an account to begin your journey.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...signInForm}>
                  <form
                    onSubmit={signInForm.handleSubmit(handleSignIn)}
                    className="space-y-4"
                  >
                    <FormField
                      control={signInForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="you@example.com"
                              {...field}
                              type="email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signInForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input placeholder="••••••••" {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardContent className="text-center">
                <Button variant="link" size="sm" onClick={() => setActiveTab('forgot-password')}>
                  Forgot your password?
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sign-up">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  It's quick and easy to get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...signUpForm}>
                  <form
                    onSubmit={signUpForm.handleSubmit(handleSignUp)}
                    className="space-y-4"
                  >
                    <FormField
                      control={signUpForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="you@example.com"
                              {...field}
                              type="email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input placeholder="••••••••" {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input placeholder="••••••••" {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="forgot-password">
            <Card>
              <CardHeader>
                <CardTitle>Forgot Password</CardTitle>
                <CardDescription>
                  Enter your email to receive a reset link.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...forgotPasswordForm}>
                  <form
                    onSubmit={forgotPasswordForm.handleSubmit(handlePasswordReset)}
                    className="space-y-4"
                  >
                    <FormField
                      control={forgotPasswordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="you@example.com"
                              {...field}
                              type="email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Reset Link
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
