import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type FinalCTAProps = { data?: any };

const FinalCTA = ({ data }: FinalCTAProps) => {
  const title = data?.title || "Your Story Isn't Written Yet.";
  const subtitle = data?.subtitle || "Join thousands of learners who chose to pick up their DeepScode and start building something brilliant.";
  const button = data?.buttons?.[0] || data?.button || data?.button1 || { text: 'ENROL FOR FREE', link: '/courses' };

  return (
    <section className="gradient-hero border-t border-border py-20 lg:py-28">
      <div className="container text-center">
        <h2 className="text-3xl font-bold text-foreground lg:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground font-medium">{subtitle}</p>
        <Button size="xl" className="mt-8 text-white font-medium hover:bg-[#4a6ff7]" asChild>
          <Link to={button.link || '/courses'}>{button.text || 'Start Learning →'}</Link>
        </Button>
      </div>
    </section>
  );
};

export default FinalCTA;
