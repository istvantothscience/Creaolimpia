import { Flame as FlameIcon } from 'lucide-react';

export default function OlympiaFlame() {
  return (
    <div className="max-w-4xl mx-auto pb-16 flex flex-col items-center">
      <style>
        {`
          .olympic-fire {
            position: relative;
            width: 140px;
            height: 200px;
            margin: 0 auto;
            transform-origin: bottom center;
            filter: drop-shadow(0 0 40px rgba(230, 126, 34, 0.4));
          }

          .flame-main {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 180px;
            background: radial-gradient(100% 100% at 50% 100%, #ffffff 0%, #ffeb3b 20%, #ff9800 50%, #f44336 80%, rgba(244,67,54,0) 100%);
            border-radius: 50% 50% 20% 20% / 60% 60% 40% 40%;
            animation: flicker 0.15s ease-in-out infinite alternate, wave 2s ease-in-out infinite;
            transform-origin: bottom center;
            mix-blend-mode: screen;
            opacity: 0.9;
          }

          .flame-core {
            position: absolute;
            bottom: 5px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 100px;
            background: radial-gradient(100% 100% at 50% 100%, #ffffff 0%, #fffffff0 30%, #ffeb3b 70%, rgba(255,235,59,0) 100%);
            border-radius: 50% 50% 20% 20% / 60% 60% 40% 40%;
            animation: flicker-core 0.12s ease-in-out infinite alternate;
            transform-origin: bottom center;
            mix-blend-mode: screen;
          }

          .flame-particle-1, .flame-particle-2, .flame-particle-3 {
            position: absolute;
            bottom: 20px;
            background: #ff9800;
            border-radius: 50%;
            filter: blur(2px);
            mix-blend-mode: screen;
          }
          
          .flame-particle-1 {
            width: 30px; height: 30px;
            left: 20%;
            animation: rise-1 1s ease-in infinite;
          }
          
          .flame-particle-2 {
            width: 20px; height: 20px;
            left: 60%;
            background: #ffeb3b;
            animation: rise-2 1.4s ease-in infinite;
          }

          .flame-particle-3 {
            width: 40px; height: 40px;
            left: 35%;
            background: #f44336;
            animation: rise-3 1.2s ease-in infinite;
          }

          @keyframes flicker {
            0% { transform: translateX(-50%) scaleX(0.95) scaleY(1.05); }
            100% { transform: translateX(-50%) scaleX(1.05) scaleY(0.95); opacity: 1; }
          }
          
          @keyframes flicker-core {
            0% { transform: translateX(-50%) scaleX(0.9) scaleY(1.1); opacity: 0.8;}
            100% { transform: translateX(-50%) scaleX(1.0) scaleY(0.9); opacity: 1; }
          }

          @keyframes wave {
            0%, 100% { border-radius: 50% 50% 20% 20% / 60% 60% 40% 40%; }
            33% { border-radius: 45% 55% 20% 20% / 65% 55% 40% 40%; }
            66% { border-radius: 55% 45% 20% 20% / 55% 65% 40% 40%; }
          }

          @keyframes rise-1 {
            0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
            100% { transform: translate(-20px, -150px) scale(0); opacity: 0; }
          }
          
          @keyframes rise-2 {
            0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
            100% { transform: translate(30px, -120px) scale(0); opacity: 0; }
          }

          @keyframes rise-3 {
            0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
            100% { transform: translate(10px, -180px) scale(0); opacity: 0; }
          }
          
          .torch-glow {
            position: absolute;
            top: 40%; left: 50%;
            transform: translate(-50%, -50%);
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(230,126,34,0.15) 0%, rgba(230,126,34,0) 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 0;
            animation: pulse-glow 2s ease-in-out infinite alternate;
          }
          
          @keyframes pulse-glow {
            0% { opacity: 0.8; transform: translate(-50%, -50%) scale(0.9); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          }
        `}
      </style>

      {/* Header */}
      <div className="text-center space-y-4 pt-12 mb-20 relative z-20">
        <FlameIcon className="w-12 h-12 mx-auto text-crea-primary opacity-80" />
        <h1 className="text-4xl sm:text-5xl font-display font-black text-crea-text tracking-widest uppercase">
          Olimpiai Láng
        </h1>
        <p className="text-sm font-bold text-crea-muted uppercase tracking-[0.2em] mt-2 flex items-center justify-center">
          <span className="w-12 h-px bg-crea-accent/30 mr-4"></span>
          Az Örök Tűz
          <span className="w-12 h-px bg-crea-accent/30 ml-4"></span>
        </p>
      </div>

      <div className="relative mt-8">
        
        {/* Glow behind torch */}
        <div className="torch-glow"></div>

        {/* The Fire */}
        <div className="olympic-fire z-10 -mb-4">
          <div className="flame-particle-3"></div>
          <div className="flame-particle-1"></div>
          <div className="flame-main"></div>
          <div className="flame-core"></div>
          <div className="flame-particle-2"></div>
        </div>

        {/* The Torch Structure */}
        <div className="relative flex flex-col items-center z-20">
          
          {/* Torch Crown / Rim */}
          <div className="w-[130px] h-4 bg-gradient-to-r from-[#B17A44] via-[#FFEBC1] to-[#8C3A27] rounded-full shadow-[0_3px_10px_rgba(0,0,0,0.4)] z-30 relative top-1 border-b border-[#5A2315]/50"></div>

          {/* Torch Bowl */}
          <div className="w-[124px] h-20 bg-gradient-to-b from-[#8C3A27] to-[#4a1f14] 
            rounded-b-[45px] rounded-t-sm shadow-[inset_0_-8px_15px_rgba(0,0,0,0.6),_0_10px_20px_rgba(0,0,0,0.4)] 
            relative overflow-hidden border-x-2 border-[#CFA052]/30 flex flex-col items-center">
            
            {/* Meander Pattern (Greek Decoration) */}
            <div className="absolute top-3 left-0 w-full flex items-center justify-center opacity-70">
                <div className="h-6 w-full flex flex-nowrap justify-center items-center -space-x-[2px]">
                   {[...Array(6)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CFA052" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                      <polyline points="0,24 0,0 24,0 24,16 8,16 8,8 16,8" />
                    </svg>
                   ))}
                </div>
            </div>

            {/* Shine highlight */}
            <div className="absolute left-6 top-0 bottom-0 w-10 bg-gradient-to-r from-white/0 via-white/10 to-white/0 skew-x-12 mix-blend-overlay"></div>
          </div>
          
          {/* Torch Stem Base Connector */}
          <div className="w-16 h-6 mt-[-3px] bg-gradient-to-r from-[#8C3A27] via-[#CFA052] to-[#4a1f14] rounded-lg shadow-md z-10 border-y border-[#2C241B]/80 flex items-center justify-center">
              <div className="w-12 h-1 bg-black/20 rounded-full"></div>
          </div>
          
          {/* Torch Handle */}
          <div className="w-10 h-[320px] mt-[-2px] bg-gradient-to-r from-[#2C241B] via-[#5A2315] to-[#1a1510] rounded-b-full shadow-[inset_0_-20px_20px_rgba(0,0,0,0.9),_0_20px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
            
            {/* Grip Wrapping Effect */}
            <div className="absolute inset-0 opacity-40 flex flex-col justify-start pt-2">
              {[...Array(14)].map((_, i) => (
                <div key={i} className="w-full h-6 border-b-2 border-[#CFA052] transform -skew-y-[20deg] rotate-[-5deg] mix-blend-overlay" style={{ marginTop: '4px' }}></div>
              ))}
            </div>

            {/* Reflected shine */}
            <div className="absolute left-2 top-0 bottom-0 w-2 bg-gradient-to-r from-white/0 via-white/10 to-white/0 blur-[1px]"></div>
          </div>
          
          {/* Bottom Knob */}
          <div className="w-14 h-8 mt-[-10px] bg-gradient-to-r from-[#8C3A27] via-[#CFA052] to-[#4a1f14] rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.6)] z-10 relative overflow-hidden border-b-2 border-black/40">
             <div className="absolute inset-x-0 top-1 h-[2px] bg-white/20"></div>
          </div>
          
        </div>
      </div>

      <div className="mt-24 max-w-xl text-center z-20 px-4">
        <div className="bg-[#FAF8F5] relative before:absolute before:inset-2 before:border-2 before:border-crea-accent/20 before:pointer-events-none rounded-sm shadow-[0_8px_30px_rgba(44,36,27,0.1)] border border-crea-accent/30 p-8 sm:p-10">
          <p className="text-crea-text font-display font-medium text-lg leading-relaxed text-center relative z-10 italic">
            „Ahogy Prométheusz lehozta a tüzet az Olümposzról, úgy hozza el ez a láng a Crea Olimpia szellemét. Égjen bennünk a küzdeni akarás, a becsület és a tisztelet tüze örökké!”
          </p>
          <div className="w-24 h-px bg-crea-accent/50 mx-auto mt-8 relative z-10"></div>
        </div>
      </div>
    </div>
  );
}
