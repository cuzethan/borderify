import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('Invalid email or password.');
    } else {
      navigate('/app');
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <img src="/logo.png" alt="Borderify logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            <h1 className="text-3xl font-bold tracking-tight">Borderify</h1>
          </div>
          <p className="mt-2 text-sm text-neutral-400">Sign in to your account</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="block text-sm">
            <span className="mb-1.5 block text-neutral-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm placeholder-neutral-600 outline-none focus:border-emerald-500"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-neutral-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm placeholder-neutral-600 outline-none focus:border-emerald-500"
            />
          </label>

          <div className="flex items-center justify-between text-xs text-neutral-400">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="accent-emerald-500" />
              Remember me
            </label>
            <a href="#" className="hover:text-emerald-400">
              Forgot password?
            </a>
          </div>

          {errorMsg && (
            <p className="text-sm text-red-500">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="mt-2 rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-emerald-400 hover:underline">
            Sign up
          </Link>
        </p>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-neutral-600 hover:text-neutral-400">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
