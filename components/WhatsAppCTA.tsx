import { useEffect, useState } from "react";

interface WhatsAppCTAProps {
  message?: string;
  label?: string;
}

export default function WhatsAppCTA({
  message = "Hello, I want to learn more about FieldOps.",
  label = "Chat with Support",
}: WhatsAppCTAProps) {
  const [visible, setVisible] = useState(false);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // One-time micro bounce on first load
    const alreadyBounced = localStorage.getItem("wa_bounced");
    if (!alreadyBounced) {
      setTimeout(() => {
        setBounce(true);
        localStorage.setItem("wa_bounced", "true");
      }, 1500);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  const whatsappUrl = `https://wa.me/96170126177?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Support on WhatsApp"
      className="fixed bottom-6 right-6 z-[9999] group"
    >
      <div
        className={`
          relative flex items-center justify-center
          w-14 h-14
          rounded-full
          bg-gradient-to-br from-green-400 to-green-600
          shadow-[0_10px_25px_rgba(0,0,0,0.25)]
          backdrop-blur-md
          transition-all duration-300
          hover:scale-105
          hover:shadow-[0_15px_35px_rgba(0,0,0,0.35)]
          ${bounce ? "animate-wa-bounce" : ""}
        `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          fill="white"
          className="w-6 h-6"
        >
          <path d="M19.11 17.21c-.29-.15-1.7-.84-1.96-.94-.26-.1-.45-.15-.64.15-.19.29-.74.94-.9 1.13-.16.19-.32.22-.61.07-.29-.15-1.23-.45-2.34-1.43-.87-.77-1.45-1.72-1.62-2.01-.16-.29-.02-.45.13-.6.14-.14.29-.36.44-.55.15-.19.2-.32.3-.53.1-.22.05-.4-.02-.55-.07-.15-.64-1.54-.88-2.11-.23-.55-.47-.47-.64-.48h-.55c-.19 0-.5.07-.76.36s-1 1-.99 2.45c.01 1.45 1.02 2.85 1.17 3.04.15.19 2.02 3.1 4.9 4.35.69.3 1.23.48 1.65.61.69.22 1.31.19 1.8.11.55-.08 1.7-.69 1.94-1.35.24-.66.24-1.23.17-1.35-.07-.11-.26-.19-.55-.34z" />
        </svg>
      </div>

      {/* Tooltip */}
      <span
        className="
          absolute right-16 top-1/2 -translate-y-1/2
          bg-gray-900 text-white text-sm
          px-3 py-1.5 rounded-lg
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          whitespace-nowrap
        "
      >
        {label}
      </span>
    </a>
  );
}
