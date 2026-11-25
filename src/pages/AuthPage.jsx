import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext.jsx';
import logo from '../assets/logo.png';

export default function AuthPage({ mode = 'login' }) {
  const isSignup = mode === 'signup';
  const { login, register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!loading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isSignup) await register(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) { setError(err.message || 'Authentication failed. Please try again.'); }
    finally { setBusy(false); }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,255,255,0.09),transparent_55%)]" />
      <Link to="/" className="absolute left-5 top-5 inline-flex items-center gap-2 text-xs text-zinc-400 transition hover:text-white md:left-10 md:top-8"><ArrowLeft size={15}/> Back to home</Link>
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="AURVEX" className="mb-4 h-16 w-auto object-contain" />
          <p className="text-[10px] uppercase tracking-[0.42em] text-zinc-500">ShadowShield security platform</p>
          <h1 className="mt-5 text-2xl font-light tracking-[0.18em]">{isSignup ? 'CREATE ACCOUNT' : 'WELCOME BACK'}</h1>
          <p className="mt-2 text-xs text-zinc-500">{isSignup ? 'Create your secure AURVEX workspace' : 'Sign in to access your security workspace'}</p>
        </div>
        <form onSubmit={submit} className="glass space-y-5 p-6 md:p-8">
          {isSignup && <label className="block space-y-2"><span className="text-xs text-zinc-400">Full name</span><span className="relative block"><UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16}/><input className="field w-full !rounded-xl !py-3 !pl-11" autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required minLength={2} maxLength={80}/></span></label>}
          <label className="block space-y-2"><span className="text-xs text-zinc-400">Email address</span><span className="relative block"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16}/><input className="field w-full !rounded-xl !py-3 !pl-11" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></span></label>
          <label className="block space-y-2"><span className="text-xs text-zinc-400">Password</span><span className="relative block"><LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16}/><input className="field w-full !rounded-xl !py-3 !pl-11 !pr-12" type={showPassword?'text':'password'} autoComplete={isSignup?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required minLength={8}/><button type="button" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(v=>!v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></span><span className="block text-[10px] text-zinc-600">Use at least 8 characters.</span></label>
          {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">{error}</p>}
          <button className="btn btn-solid w-full !rounded-xl !py-3" type="submit" disabled={busy || loading}>{busy?'Please wait…':isSignup?'Create account':'Sign in'} <ArrowRight size={15}/></button>
          <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-600"><ShieldCheck size={13}/> Secure connection to your AURVEX server</div>
        </form>
        <p className="mt-6 text-center text-xs text-zinc-500">{isSignup?'Already have an account?':'New to AURVEX?'} <Link className="text-white underline underline-offset-4 hover:text-zinc-300" to={isSignup?'/login':'/signup'}>{isSignup?'Log in':'Create an account'}</Link></p>
      </motion.section>
    </main>
  );
}
