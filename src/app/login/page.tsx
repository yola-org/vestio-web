'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ArrowIcon } from '@/components/shared/Icons';
import {authApi, callApi} from '@/lib/api';
import { notifyAuthChanged } from '@/lib/auth';
import { useNotifications } from '@/components/shared/NotificationProvider';
import {ApiCallError} from "@/lib/api/call.ts";

export default function LoginPage() {
  const router = useRouter();
  const { notify } = useNotifications();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    const result = await callApi(authApi.login({ email, password }), {
      errors: { ERR_UNAUTHORIZED: 'Email ou mot de passe incorrect.' },
    });

    await result.handle({
      onSuccess: () => {
        notifyAuthChanged();
        notify.success('Connexion réussie. Bienvenue sur Vestio !');
        router.push('/');
      },
      onError: (error : ApiCallError) => {
        if (error.code === 'ERR_UNAUTHORIZED') {
          setLoginError(error.message);
        }
      }
    });
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#151515]">
      <Header />
      <main className="py-20 main-container">
        <div className="mx-auto max-w-md bg-white p-8 shadow-sm rounded-2xl">
          <h1 className="text-4xl font-black tracking-tight mb-2">Bon retour !</h1>
          <p className="text-black/60 mb-8">Connectez-vous pour accéder à votre dressing et vos favoris.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                placeholder="votre@email.com"
                autoComplete="email"
                required
                value={email}
                aria-invalid={Boolean(loginError)}
                aria-describedby={loginError ? 'login-error' : undefined}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setLoginError('');
                }}
                className={`w-full h-12 px-4 rounded-xl border ${loginError ? 'border-red-500' : 'border-black/15'} focus:border-[#173fdb] focus:ring-2 focus:ring-[#173fdb]/10 outline-none transition`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="password">Mot de passe</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={password}
                aria-invalid={Boolean(loginError)}
                aria-describedby={loginError ? 'login-error' : undefined}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setLoginError('');
                }}
                className={`w-full h-12 px-4 rounded-xl border ${loginError ? 'border-red-500' : 'border-black/15'} focus:border-[#173fdb] focus:ring-2 focus:ring-[#173fdb]/10 outline-none transition`}
              />
            </div>
            <button disabled={isSubmitting} className="w-full bg-[#173fdb] text-white h-12 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#1335b8] transition disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Connexion...' : 'Se connecter'} <ArrowIcon className="h-5 w-5" />
            </button>
          </form>
          {loginError && (
            <p id="login-error" role="alert" className="mt-4 text-sm font-medium text-red-700">
              {loginError}
            </p>
          )}
          
          <div className="mt-8 pt-8 border-t border-black/10 text-center">
            <p className="text-sm text-black/60 mb-4">Pas encore de compte ?</p>
            <Link href="/register" className="inline-block text-[#ff5d39] font-bold hover:underline">
              Rejoindre la communauté Vestio
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
