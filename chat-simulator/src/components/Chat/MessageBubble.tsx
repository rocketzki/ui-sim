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
      className={`message-bubble ${isSent ? 'sent' : 'received'}`}
    >
      <div className="message-author">{message.sender}</div>
      <div className="message-content">{message.content}</div>
      {message.timestamp && (
        <div className="message-timestamp">{message.timestamp}</div>
      )}
      {message.reactions && message.reactions.length > 0 && (
        <div className="reactions mt-2">
          {message.reactions.map((reaction, index) => (
            <span key={index} className="reaction">
              {reaction.emoji} {reaction.count}
            </span>
          ))}
        </div>
      )}
      {message.attachments && message.attachments.length > 0 && (
        <div className="attachments mt-2">
          {message.attachments.map((attachment, index) => (
            <div key={index} className="attachment">
              📎 {attachment.name} ({attachment.size})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

