
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

const ROBOT_URL = 'https://my.spline.design/roborobo-IpdXRsB7Sa2Tlbygah7QxMFF/';
const side = 'pointer-events-none absolute top-[42%] hidden text-5xl font-light uppercase tracking-wide md:block xl:text-7xl';

export default function Landing() {

  return (
    <main className="relative h-dvh min-h-[480px] overflow-hidden bg-black">
      <iframe src={ROBOT_URL} title="3D robot animation" className="absolute inset-0 h-full w-full border-0" />
      <img src={logo} alt="AURVEX logo" className="pointer-events-none absolute left-5 top-5 h-14 w-auto md:left-10 md:h-20" />
      <motion.h1 initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="pointer-events-none absolute inset-x-0 top-28 text-center text-4xl tracking-[0.2em] md:top-8 md:text-6xl">
        AURVEX
      </motion.h1>
      <nav className="absolute right-5 top-8 flex gap-3 md:right-10">
        <Link to="/login" className="btn">Log in</Link>
        <Link to="/signup" className="btn btn-solid">Sign up</Link>
      </nav>
      <p className={`${side} left-[8vw] lg:left-[13vw]`}>Shadow</p>
      <p className={`${side} right-[8vw] lg:right-[13vw]`}>Shield</p>
      <div className="absolute inset-x-0 bottom-16 flex flex-col items-center gap-3">
        <Link to="/login" className="btn btn-solid !px-8 !py-3">Launch Dashboard <ArrowRight size={16} /></Link>
        <p className="pointer-events-none text-xs text-zinc-500">AI-powered network security for fintech</p>
      </div>
    </main>
  );
}
