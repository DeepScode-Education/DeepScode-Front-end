import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQ {
  question: string;
  answer: string;
}

interface SupportFAQProps {
  faqs: FAQ[];
}

const SupportFAQ = ({ faqs }: SupportFAQProps) => (
  <div>
    <h2 className="text-xl font-bold text-foreground">Frequently Asked Questions</h2>
    <Accordion type="single" collapsible className="mt-4 space-y-2">
      {faqs.map((faq, i) => (
        <AccordionItem
          key={i}
          value={`faq-${i}`}
          className="rounded-xl border border-border bg-card px-5 shadow-sm"
        >
          <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

export default SupportFAQ;
