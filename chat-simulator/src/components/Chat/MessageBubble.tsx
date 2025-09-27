import React, { useEffect, useRef } from 'react';
import type { Message } from '@/types/scenario';
import { gsap } from 'gsap';

interface Props {
  message: Message;
  isSent: boolean;
}

export const MessageBubble: React.FC<Props> = ({ message, isSent }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const direction = isSent ? 50 : -50;
    gsap.fromTo(
      ref.current,
      { x: direction, opacity: 0, scale: 0.95 },
      { x: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.7)' }
    );
  }, []);

  return (
    <div
      ref={ref}
      className={`message-bubble max-w-[75%] px-3 py-2 rounded-lg text-sm ${
        isSent ? 'bg-green-100 ml-auto rounded-tl-lg' : 'bg-white rounded-tr-lg'
      } shadow`}
    >
      <div>{message.content}</div>
      {message.timestamp && (
        <div className="text-[10px] text-gray-500 mt-1 text-right">{message.timestamp}</div>
      )}
    </div>
  );
};

