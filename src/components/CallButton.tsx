import { useState } from "react";
import { Phone } from "lucide-react";
import { useLocation } from "react-router-dom";

const POPUP_EXCLUDED_PREFIXES = ["/admin", "/counsellor", "/login", "/signup", "/onboarding"];

const PHONE = "+918700460998";
const PHONE_DISPLAY = "+91 8700460998";

const CallButton = () => {
  const location = useLocation();
  const [showTooltip, setShowTooltip] = useState(false);

  const isExcluded = POPUP_EXCLUDED_PREFIXES.some((prefix) =>
    location.pathname.startsWith(prefix)
  );

  if (isExcluded) return null;

  return (
   <div className="fixed bottom-40 right-6 z-[9997]">

      {/* Desktop tooltip */}
      {showTooltip && (
        <div className="absolute bottom-14 right-0 bg-white border rounded-xl shadow-lg px-4 py-3 text-sm whitespace-nowrap">
          <p className="text-gray-500 text-xs mb-1">Call us at</p>
          <p className="font-semibold text-gray-800 select-all">{PHONE_DISPLAY}</p>
        </div>
      )}

      <a
        href={`tel:${PHONE}`}
        aria-label="Call us"
        className="
          flex items-center justify-center
          w-14 h-14 rounded-full
          bg-[#0037FF] hover:bg-[#0026CC]
          text-white shadow-xl
          hover:scale-105 active:scale-95
          transition-transform
        "
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => {
          const isMobile = window.matchMedia("(pointer: coarse)").matches;
          if (!isMobile) e.preventDefault();
        }}
      >
        <Phone className="h-5 w-5" />
      </a>
    </div>
  );
};

export default CallButton;