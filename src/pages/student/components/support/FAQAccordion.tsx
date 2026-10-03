import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQAccordionProps {
  question: string;
  answer: string;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({
  question,
  answer,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="transition-all duration-300">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          flex
          w-full
          items-center
          justify-between
          gap-4
          px-6
          py-5
          text-left
          transition-colors
          duration-300
          hover:bg-[#F8FAFC]
        "
      >
        <h3
          className={`
            text-[16px]
            font-semibold
            transition-colors
            duration-300
            ${
              isOpen
                ? "text-[#2563EB]"
                : "text-[#111827]"
            }
          `}
        >
          {question}
        </h3>

        <ChevronDown
          size={20}
          className={`
            flex-shrink-0
            transition-transform
            duration-300
            ${
              isOpen
                ? "rotate-180 text-[#2563EB]"
                : "rotate-0 text-[#6B7280]"
            }
          `}
        />
      </button>

      <div
        className={`
          grid
          transition-all
          duration-300
          ease-in-out
          ${
            isOpen
              ? "grid-rows-[1fr]"
              : "grid-rows-[0fr]"
          }
        `}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pr-12">
            <p className="text-[15px] leading-7 text-[#6B7280]">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQAccordion;