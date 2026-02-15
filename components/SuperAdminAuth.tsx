
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Terminal, Lock, X, Fingerprint, Cpu, AlertTriangle, Delete, CornerDownLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import { playSound } from '../utils/sound';

const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '011000100111001001101111011010110110010101101110'; // Binary
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#450a0a'; // Deep Red Text
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40 pointer-events-none" />;
};

const SuperAdminAuth: React.FC = () => {
  const { superAdminLogin } = useStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Parallax Tilt State
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  // Hidden Trigger 1: Keyboard Shortcut (Ctrl+Shift+X)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'X' || e.key === 'x')) {
        e.preventDefault();
        setIsOpen(true);
        playSound('beep');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hidden Trigger 2: Global Event
  useEffect(() => {
    const handleCustomEvent = () => {
        setIsOpen(true);
        playSound('beep');
    };
    window.addEventListener('trigger-root-access', handleCustomEvent);
    return () => window.removeEventListener('trigger-root-access', handleCustomEvent);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -10; // Max rotation deg
    const rotateYValue = ((x - centerX) / centerX) * 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const attemptLogin = async () => {
    setLoading(true);
    setError(false);

    // Simulate biometric scan delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const success = await superAdminLogin(pin);
    
    if (success) {
      playSound('success');
      setIsOpen(false);
      setPin('');
      navigate('/system-root');
    } else {
      playSound('error');
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 500);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await attemptLogin();
  };

  const handleKeypadClick = (key: string) => {
      playSound('click');
      if (key === 'C') {
          setPin('');
          setError(false);
      } else if (key === 'ENTER') {
          if (pin.length > 0) attemptLogin();
      } else {
          if (pin.length < 4) {
             setPin(prev => prev + key);
          } else {
             playSound('error'); // Limit reached
          }
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 perspective-[1000px] overflow-hidden">
      <MatrixBackground />
      
      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>

      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transition: 'transform 0.1s ease-out'
        }}
        className={`
            relative z-20 w-full max-w-lg bg-black/40 backdrop-blur-xl 
            border border-red-900/50 rounded-xl p-8 
            shadow-[0_0_100px_rgba(220,38,38,0.3),inset_0_0_20px_rgba(220,38,38,0.1)]
            ${error ? 'animate-shake border-red-500' : ''}
        `}
      >
        {/* Holographic Borders */}
        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-red-500 rounded-tl-lg"></div>
        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-red-500 rounded-tr-lg"></div>
        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-red-500 rounded-bl-lg"></div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-red-500 rounded-br-lg"></div>

        {/* Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 text-red-800 hover:text-red-500 transition-colors z-50"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="relative flex flex-col items-center">
            
            {/* Header / HUD */}
            <div className="w-full flex justify-between items-end border-b border-red-900/50 pb-2 mb-6">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
                        <ShieldAlert className="text-red-600 animate-pulse" />
                        ROOT ACCESS
                    </h2>
                    <p className="text-[10px] text-red-500 font-mono tracking-[0.2em] uppercase">
                        Auth_Level: 0 (God Mode)
                    </p>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1 text-[10px] text-amber-500 font-mono">
                        <AlertTriangle size={10} />
                        <span>SECURE_CONNECTION</span>
                    </div>
                    <div className="text-[10px] text-red-800 font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                </div>
            </div>

            {/* Biometric Animation */}
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center border border-red-900/30 rounded-full bg-red-950/10 overflow-hidden">
                <Fingerprint size={48} className={`text-red-700 ${loading ? 'opacity-50' : 'opacity-100'}`} />
                {/* Laser Scan Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] animate-scan"></div>
                
                {/* HUD Circle Ring */}
                <div className="absolute inset-0 border border-red-500/20 rounded-full animate-spin-slow border-t-transparent border-l-transparent"></div>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="relative group">
                    <label className="text-[10px] text-red-400 font-mono uppercase mb-1 block pl-1">
                        Enter Security Token
                    </label>
                    <div className="relative overflow-hidden rounded-lg bg-black/60 border border-red-900 group-focus-within:border-red-500 group-focus-within:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all">
                        <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-red-900/50 bg-red-950/20">
                            <Terminal size={18} className="text-red-500" />
                        </div>
                        <input 
                            type="password" 
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            maxLength={4}
                            // Keep input for keyboard support, but style it to fit
                            className="w-full bg-transparent text-red-500 text-center text-3xl font-mono tracking-[1em] py-3 pl-12 pr-4 outline-none placeholder-red-900/20"
                            placeholder="••••"
                        />
                        {/* Glitch Effect on Error */}
                        {error && (
                             <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none"></div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="text-center">
                        <p className="text-red-500 text-xs font-mono font-bold animate-pulse bg-red-950/50 inline-block px-4 py-1 rounded border border-red-900">
                            [ERROR]: HASH MISMATCH // RETRY
                        </p>
                    </div>
                )}
            </form>

            {/* Holographic Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] my-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        type="button"
                        onClick={() => handleKeypadClick(num.toString())}
                        className="
                           relative h-12 border border-red-900/60 bg-red-950/20 
                           text-red-500 font-mono text-xl font-bold
                           hover:bg-red-900/40 hover:text-red-300 hover:border-red-500 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]
                           active:scale-95 transition-all duration-100
                           flex items-center justify-center rounded-sm group
                        "
                    >
                        {num}
                        {/* Corner markers */}
                        <div className="absolute top-0.5 left-0.5 w-1 h-1 border-t border-l border-red-500/30 group-hover:border-red-400"></div>
                        <div className="absolute bottom-0.5 right-0.5 w-1 h-1 border-b border-r border-red-500/30 group-hover:border-red-400"></div>
                    </button>
                ))}
                
                <button
                    type="button"
                    onClick={() => handleKeypadClick('C')}
                    className="
                       relative h-12 border border-red-900/60 bg-red-950/20 
                       text-red-500 hover:text-red-300 hover:border-red-500 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]
                       active:scale-95 transition-all duration-100
                       flex items-center justify-center rounded-sm group
                    "
                >
                    <Delete size={20} />
                </button>
                
                <button
                    type="button"
                    onClick={() => handleKeypadClick('0')}
                    className="
                       relative h-12 border border-red-900/60 bg-red-950/20 
                       text-red-500 font-mono text-xl font-bold
                       hover:bg-red-900/40 hover:text-red-300 hover:border-red-500 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]
                       active:scale-95 transition-all duration-100
                       flex items-center justify-center rounded-sm group
                    "
                >
                    0
                </button>
                
                <button
                    type="button"
                    onClick={() => handleKeypadClick('ENTER')}
                    disabled={loading}
                    className="
                       relative h-12 border border-red-900/60 bg-red-900/40 
                       text-red-100 hover:text-white hover:border-red-400 hover:bg-red-800 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]
                       active:scale-95 transition-all duration-100
                       flex items-center justify-center rounded-sm group
                    "
                >
                    {loading ? <Cpu className="animate-spin" size={20} /> : <CornerDownLeft size={20} />}
                </button>
            </div>

            {/* Footer Metadata */}
            <div className="w-full flex justify-between items-end border-t border-red-900/30 pt-2 text-[9px] text-red-900/60 font-mono">
                <div>
                    <p>TERMINAL_ID: T-800-X</p>
                    <p>ENCRYPTION: AES-256-GCM</p>
                </div>
                <div className="text-right">
                    <p>LAT: 33.8938 N</p>
                    <p>LNG: 35.5018 E</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAuth;
