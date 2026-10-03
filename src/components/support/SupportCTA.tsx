import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SupportCTAProps {
  title?: string;
  description?: string;
  buttonText?: string;
  variant?: "default" | "report";
}

const SupportCTA = ({
  title = "Still need help?",
  description = "Our support team is ready to assist you. Submit a ticket and we'll get back to you shortly.",
  buttonText = "Contact Support",
  variant = "default",
}: SupportCTAProps) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-border bg-accent/30 p-8 text-center">
      <MessageCircle className="mx-auto h-8 w-8 text-[#0037FF]" />
      <h3 className="mt-3 text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
      <Button
        onClick={() => navigate("/support#ticket")}
        variant={variant === "report" ? "orange" : "hero"}
        size="lg"
        className="mt-5"
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default SupportCTA;
