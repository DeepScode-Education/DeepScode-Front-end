import React from "react";
import StudentLayout from "../components/StudentLayout";
import SupportCard from "../components/support/SupportCard";
import FAQAccordion from "../components/support/FAQAccordion";
import { supportCards, faqData } from "../components/support/supportData";

const Support = () => {
  return (
    <StudentLayout title="Support" subtitle="We're with you at every step.">
      <div className="space-y-6">
        {/* Support Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {supportCards.map((item) => (
            <SupportCard key={item.id} {...item} />
          ))}
        </div>

        {/* FAQ */}
        <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="border-b border-[#EEF2F7] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#111827]">
              Frequently asked questions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Find quick answers to the most common student queries.
            </p>
          </div>

          <div className="divide-y divide-[#EEF2F7]">
            {faqData.map((faq) => (
              <FAQAccordion
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Support;
