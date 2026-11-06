'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ArrowIcon } from '@/components/shared/Icons';
import Button from '@/components/shared/Button';
import { authApi } from '@/lib/api';
import { useApiForm } from '@/hooks/use-api-form';
import { useNotifications } from '@/components/shared/NotificationProvider';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const { notify } = useNotifications();
  const { formAction, pending } = useApiForm((formData) => {
    const [firstName = '', ...lastName] = String(formData.get('name') ?? '').trim().split(/\s+/);

    return authApi.signup({
      firstName,
      lastName: lastName.join(' '),
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    });
  }, {
    loading: false,
    onSuccess: () => {
      notify.success(t('auth.register.success'));
      router.push('/login');
    },
  });

  return (
    <div className="min-h-screen bg-background text-primary">
      <Header />
      <main className="py-20 main-container">
        <div className="mx-auto max-w-md bg-white p-8 shadow-sm rounded-2xl">
          <h1 className="text-4xl font-black tracking-tight mb-2">{t('auth.register.title')}</h1>
          <p className="text-black/60 mb-8">{t('auth.register.subtitle')}</p>
          
          <form className="space-y-5" action={formAction}>
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="name">{t('auth.register.fullName')}</label>
              <input 
                type="text" 
                id="name" 
                name="name"
                placeholder={t('auth.register.fullNamePlaceholder')}
                className="w-full h-12 px-4 rounded-xl border border-black/15 focus:border-deep-accent focus:ring-2 focus:ring-deep-accent/10 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="email">{t('auth.register.email')}</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                placeholder={t('auth.register.emailPlaceholder')}
                className="w-full h-12 px-4 rounded-xl border border-black/15 focus:border-deep-accent focus:ring-2 focus:ring-deep-accent/10 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="password">{t('auth.register.password')}</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                placeholder={t('auth.register.passwordPlaceholder')}
                className="w-full h-12 px-4 rounded-xl border border-black/15 focus:border-deep-accent focus:ring-2 focus:ring-deep-accent/10 outline-none transition"
              />
            </div>
            <Button
              type="submit"
              loading={pending}
              className="w-full bg-accent text-white h-12 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('auth.register.submit')} <ArrowIcon className="h-5 w-5" />
            </Button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-black/10 text-center">
            <p className="text-sm text-black/60 mb-4">{t('auth.register.alreadyMember')}</p>
            <Link href="/login" className="inline-block text-deep-accent font-bold hover:underline">
              {t('auth.register.loginLink')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
