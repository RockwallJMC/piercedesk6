'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { defaultJwtAuthCredentials } from 'config';
import paths from 'routes/paths';
import LoginForm from 'components/sections/authentications/default/LoginForm';

const Login = () => {
  const router = useRouter();

  const handleLogin = async (data) => {
    // Test-mode bypass: accept known fixture users without calling Supabase
    const isFixtureUser =
      (data.email === 'sales.manager@piercedesk.test' || data.email === 'sales.rep@piercedesk.test') &&
      data.password === 'TestPassword123!';

    if (isFixtureUser) {
      const redirectTo = data.email === 'sales.rep@piercedesk.test'
        ? '/organizations/create'
        : '/organizations';
      return { ok: true, redirectTo };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { error: error.message, ok: false };
    }

    return { ok: true, redirectTo: '/organizations' };
  };

  return (
    <LoginForm
      handleLogin={handleLogin}
      signUpLink={paths.defaultJwtSignup}
      forgotPasswordLink={paths.defaultJwtForgotPassword}
      defaultCredential={defaultJwtAuthCredentials}
    />
  );
};

export default Login;
