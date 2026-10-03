import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Lock, ArrowLeft, CheckCircle, CreditCard, Smartphone, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useToast } from "@/hooks/use-toast";

const courseInfo: Record<string, { title: string; price: number; originalPrice: number; duration: string }> = {
  "1": { title: "UI/UX Design Fundamentals", price: 149, originalPrice: 299, duration: "8 weeks" },
  "2": { title: "Full-Stack Web (3D)", price: 249, originalPrice: 499, duration: "12 weeks" },
};

const defaultInfo = { title: "Course", price: 149, originalPrice: 299, duration: "8 weeks" };

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const course = courseInfo[id || ""] || defaultInfo;

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "wallet">("card");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", card: "", expiry: "", cvv: "", upi: "" });
  const [processing, setProcessing] = useState(false);

  const total = course.price - discount;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "SLATE20") {
      setDiscount(Math.round(course.price * 0.2));
      toast({ title: "Coupon applied!", description: "20% discount has been applied." });
    } else {
      toast({ title: "Invalid coupon", description: "Please check your coupon code.", variant: "destructive" });
    }
  };

  const handlePayment = () => {
    if (!formData.name || !formData.email) {
      toast({ title: "Missing information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep(3);
    }, 2000);
  };

  const steps = ["Details", "Payment", "Confirmation"];

  return (
    <div className="min-h-screen bg-background">
    

      <div className="container py-8 lg:py-12">
        <Link to={`/courses/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>

        {/* Step Indicator */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2 sm:gap-4">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${i + 1 < step + 1 ? "gradient-primary text-[#0037FF]-foreground" : i + 1 === step + 1 ? "border-2 border-primary text-[#0037FF]" : "bg-muted text-muted-foreground"
                    }`}>
                    {i + 1 < step + 1 ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-sm hidden sm:block ${i + 1 <= step + 1 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</span>
                </div>
                {i < 2 && <div className={`h-px w-6 sm:w-12 ${i + 1 < step + 1 ? "bg-[#0037FF]" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 3 ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="rounded-xl border border-border bg-card p-10 shadow-card">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                  <CheckCircle className="h-8 w-8 text-[#0037FF]" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-foreground">Payment Successful!</h2>
                <p className="mt-3 text-muted-foreground">Welcome to <strong>{course.title}</strong>. You'll receive a confirmation email shortly.</p>
                <div className="mt-6 rounded-lg bg-accent p-4 text-left text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Amount Paid</span><span className="font-semibold text-foreground">${total.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Course Duration</span><span className="font-semibold text-foreground">{course.duration}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Access</span><span className="font-semibold text-foreground">Lifetime</span></div>
                </div>
                <div className="mt-8 flex flex-col gap-3">
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/courses">Start Learning</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/">Go Home</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-8 lg:grid-cols-5"
            >
              {/* Sidebar */}
              <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <h3 className="font-semibold text-foreground">Order Summary</h3>
                  <div className="mt-4 border-t border-border pt-4 space-y-3">
                    <div className="text-sm font-medium text-foreground">{course.title}</div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Original Price</span>
                      <span className="text-muted-foreground line-through">${course.originalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Course Fee</span>
                      <span className="text-foreground">${course.price.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Coupon Discount</span>
                        <span className="text-[#0037FF] font-medium">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-3 flex justify-between font-semibold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground text-lg">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <label className="text-sm font-medium text-foreground">Have a coupon?</label>
                  <div className="mt-2 flex gap-2">
                    <input
                      className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g. SLATE20"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                    <Button variant="outline" onClick={applyCoupon}>Apply</Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-accent p-4">
                  <Shield className="h-5 w-5 text-[#0037FF] shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-foreground">30-Day Money Back Guarantee</div>
                    <div className="text-xs text-muted-foreground">Full refund, no questions asked</div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="lg:col-span-3 order-1 lg:order-2">
                <div className="rounded-xl border border-border bg-card p-6 lg:p-8 shadow-card">
                  {step === 1 ? (
                    <>
                      <h2 className="text-xl font-bold text-foreground">Your Details</h2>
                      <p className="mt-1 text-sm text-muted-foreground">We'll use this for your account</p>
                      <div className="mt-6 space-y-4">
                        <div>
                          <label className="text-sm font-medium text-foreground">Full Name *</label>
                          <input
                            className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground">Email Address *</label>
                          <input
                            className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="john@example.com"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button
                        variant="hero"
                        size="lg"
                        className="mt-8 w-full"
                        onClick={() => {
                          if (!formData.name || !formData.email) {
                            toast({ title: "Required", description: "Please fill in your name and email.", variant: "destructive" });
                            return;
                          }
                          setStep(2);
                        }}
                      >
                        Continue to Payment
                      </Button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-foreground">Payment Details</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Choose your preferred payment method</p>

                      <div className="mt-6 space-y-5">
                        {/* Payment Method Selector */}
                        <div className="grid grid-cols-3 gap-3">
                          {([
                            { key: "card" as const, label: "Card", icon: CreditCard },
                            { key: "upi" as const, label: "UPI", icon: Smartphone },
                            { key: "wallet" as const, label: "Wallet", icon: Wallet },
                          ]).map((m) => (
                            <button
                              key={m.key}
                              onClick={() => setPaymentMethod(m.key)}
                              className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm font-medium transition-all ${paymentMethod === m.key ? "border-primary bg-accent text-[#0037FF]" : "border-border text-foreground hover:bg-accent/50"
                                }`}
                            >
                              <m.icon className="h-5 w-5" />
                              {m.label}
                            </button>
                          ))}
                        </div>

                        <AnimatePresence mode="wait">
                          {paymentMethod === "card" && (
                            <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-foreground">Card Number</label>
                                <input className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="1234 5678 9012 3456" value={formData.card} onChange={(e) => setFormData({ ...formData, card: e.target.value })} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-foreground">Expiry Date</label>
                                  <input className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="MM/YY" value={formData.expiry} onChange={(e) => setFormData({ ...formData, expiry: e.target.value })} />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-foreground">CVV</label>
                                  <input className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="123" value={formData.cvv} onChange={(e) => setFormData({ ...formData, cvv: e.target.value })} />
                                </div>
                              </div>
                            </motion.div>
                          )}
                          {paymentMethod === "upi" && (
                            <motion.div key="upi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              <label className="text-sm font-medium text-foreground">UPI ID</label>
                              <input className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="yourname@upi" value={formData.upi} onChange={(e) => setFormData({ ...formData, upi: e.target.value })} />
                            </motion.div>
                          )}
                          {paymentMethod === "wallet" && (
                            <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                              {["Google Pay", "PhonePe", "Paytm"].map((w) => (
                                <button key={w} className="flex w-full items-center gap-3 rounded-lg border border-border p-4 text-sm font-medium text-foreground hover:bg-accent/50 hover:border-primary transition-all">
                                  <Wallet className="h-5 w-5 text-[#0037FF]" />
                                  {w}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <Button variant="outline" size="lg" onClick={() => setStep(1)} className="flex-1">
                          Back
                        </Button>
                        <Button
                          variant="hero"
                          size="lg"
                          className="flex-[2]"
                          onClick={handlePayment}
                          disabled={processing}
                        >
                          {processing ? (
                            <span className="flex items-center gap-2">
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Pay ${total.toFixed(2)}</span>
                          )}
                        </Button>
                      </div>

                      <p className="mt-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Lock className="h-3 w-3" /> Secure 256-bit SSL encrypted payment
                      </p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    
    </div>
  );
};

export default Payment;
