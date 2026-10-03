
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FAQ } from "@/types/mentor";



interface FAQSectionProps {
  faqs: FAQ[];
  mentorName?: string;
}

function FAQSection({ faqs, mentorName = "your mentor" }: FAQSectionProps) {
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <section
      className="
      w-full
      bg-white
      py-20
      px-5
      "
    >
      <div
        className="
        max-w-[1240px]
        mx-auto
        "
      >
        {/* Header */}

        <div
          className="
          text-center
          mb-14
          "
        >
          <h2
            className="
            text-[26px]
            md:text-[30px]
            font-bold
            text-[#111827]
            mb-3
            "
          >
            Frequently Asked Questions
          </h2>

          <p
            className="
            text-[#6B7280]
            text-[16px]
            "
          >
            Everything you need to know about starting your journey with {mentorName}.
          </p>
        </div>

        {/* FAQ List */}

        <div
          className="
          max-w-[760px]
          mx-auto
          "
        >
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="
                border-b
                border-[#E5E7EB]
                "
            >
              <button
                onClick={() => setActiveId(activeId === faq.id ? null : faq.id)}
                className="
                  w-full
                  flex
                  items-center
                  justify-between
                  py-6
                  text-left
                  "
              >
                <span
                  className="
                    text-[16px]
                    font-semibold
                    text-[#111827]
                    "
                >
                  {faq.question}
                </span>

                <ChevronDown
                  size={18}
                  className={`
                    transition-transform
                    duration-300
                    ${activeId === faq.id ? "rotate-180" : ""}
                    `}
                />
              </button>

              <div
                className={`
                  overflow-hidden
                  transition-all
                  duration-300
                  ${activeId === faq.id ? "max-h-[200px] pb-6" : "max-h-0"}
                  `}
              >
                <p
                  className="
                    text-[#6B7280]
                    text-[16px]
                    leading-7
                    pr-10
                    "
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;