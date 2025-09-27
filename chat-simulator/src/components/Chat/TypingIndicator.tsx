import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface Props {
  sender: string;
}

export const TypingIndicator: React.FC<Props> = () => {
  const dot1 = useRef<HTMLSpanElement | null>(null);
  const dot2 = useRef<HTMLSpanElement | null>(null);
  const dot3 = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1 });
    tl.to([dot1.current, dot2.current, dot3.current], {
      opacity: 1,
      y: -2,
      duration: 0.25,
      stagger: 0.12,
      yoyo: true,
      repeat: 1,
      ease: 'power1.inOut',
    });
    return () => tl.kill();
  }, []);

  return (
    <div className="inline-flex items-center gap-1 bg-white px-3 py-2 rounded-full shadow">
      <span ref={dot1} className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full opacity-70"></span>
      <span ref={dot2} className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full opacity-70"></span>
      <span ref={dot3} className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full opacity-70"></span>
    </div>
  );
};

