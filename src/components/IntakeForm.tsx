import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  // Basic Information
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number").max(20),
  
  // Business Profile
  companyName: z.string().min(1, "Company name is required").max(100),
  websiteUrl: z.string().url("Please enter a valid URL").or(z.literal("")),
  yearsInBusiness: z.string().min(1, "Please select years in business"),
  industry: z.string().min(1, "Please enter your industry").max(100),
  
  // Financial Snapshot
  annualRevenue: z.string().min(1, "Please select annual revenue"),
  annualProfit: z.string().min(1, "Please select annual profit"),
  financialOrganization: z.string().min(1, "Please select an option"),
  
  // Operational Overview
  customerConcentration: z.string().min(1, "Please select an option"),
  ownerInvolvement: z.string().min(1, "Please select an option"),
  
  // Timeline & Intent
  timeline: z.string().min(1, "Please select your timeline"),
  additionalNotes: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: 1, title: "Basic Info", fields: ["firstName", "lastName", "email", "phone"] },
  { id: 2, title: "Business", fields: ["companyName", "websiteUrl", "yearsInBusiness", "industry"] },
  { id: 3, title: "Financials", fields: ["annualRevenue", "annualProfit", "financialOrganization"] },
  { id: 4, title: "Operations", fields: ["customerConcentration", "ownerInvolvement"] },
  { id: 5, title: "Timeline", fields: ["timeline", "additionalNotes"] },
];

interface IntakeFormProps {
  onClose?: () => void;
}

const IntakeForm: React.FC<IntakeFormProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
      websiteUrl: "",
      yearsInBusiness: "",
      industry: "",
      annualRevenue: "",
      annualProfit: "",
      financialOrganization: "",
      customerConcentration: "",
      ownerInvolvement: "",
      timeline: "",
      additionalNotes: "",
    },
    mode: "onChange",
  });

  const validateCurrentStep = async () => {
    const currentFields = steps[currentStep - 1].fields as (keyof FormData)[];
    const result = await form.trigger(currentFields);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    // Simulate API call
    console.log("Form submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 px-6"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#F4D77F] rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-[#0A1628]" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Thank You!
        </h3>
        <p className="text-white/70 mb-6 max-w-sm mx-auto">
          We've received your information. Our team will review your submission and reach out within 24 hours.
        </p>
        {onClose && (
          <Button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            Close
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                step.id < currentStep
                  ? "bg-gradient-to-br from-[#D4AF37] to-[#F4D77F] text-[#0A1628]"
                  : step.id === currentStep
                  ? "bg-white/20 text-white border-2 border-[#D4AF37]"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
            </div>
          ))}
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F4D77F]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-center text-white/60 text-sm mt-2">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Let's start with your contact info
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">First Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="John"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#D4AF37]"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Smith"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#D4AF37]"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="john@company.com"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#D4AF37]"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="(555) 123-4567"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#D4AF37]"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}

            {/* Step 2: Business Profile */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Tell us about your business
                </h3>
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Company Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Acme Inc."
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#D4AF37]"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Website URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://www.example.com"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#D4AF37]"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearsInBusiness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">How long have you been in business?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-[#D4AF37]">
                            <SelectValue placeholder="Select years in business" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0A1628] border-white/20">
                          <SelectItem value="1-2" className="text-white hover:bg-white/10">1–2 years</SelectItem>
                          <SelectItem value="3-5" className="text-white hover:bg-white/10">3–5 years</SelectItem>
                          <SelectItem value="6-10" className="text-white hover:bg-white/10">6–10 years</SelectItem>
                          <SelectItem value="10+" className="text-white hover:bg-white/10">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">What industry best describes your business?</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., SaaS, E-commerce, Manufacturing"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#D4AF37]"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}

            {/* Step 3: Financial Snapshot */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Financial snapshot
                </h3>
                <FormField
                  control={form.control}
                  name="annualRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Annual Revenue (most recent full year)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-[#D4AF37]">
                            <SelectValue placeholder="Select annual revenue" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0A1628] border-white/20">
                          <SelectItem value="under-500k" className="text-white hover:bg-white/10">Under $500K</SelectItem>
                          <SelectItem value="500k-1m" className="text-white hover:bg-white/10">$500K – $1M</SelectItem>
                          <SelectItem value="1m-3m" className="text-white hover:bg-white/10">$1M – $3M</SelectItem>
                          <SelectItem value="3m-5m" className="text-white hover:bg-white/10">$3M – $5M</SelectItem>
                          <SelectItem value="5m-10m" className="text-white hover:bg-white/10">$5M – $10M</SelectItem>
                          <SelectItem value="10m+" className="text-white hover:bg-white/10">$10M+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annualProfit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Annual Net Profit / SDE</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-[#D4AF37]">
                            <SelectValue placeholder="Select annual profit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0A1628] border-white/20">
                          <SelectItem value="under-100k" className="text-white hover:bg-white/10">Under $100K</SelectItem>
                          <SelectItem value="100k-250k" className="text-white hover:bg-white/10">$100K – $250K</SelectItem>
                          <SelectItem value="250k-500k" className="text-white hover:bg-white/10">$250K – $500K</SelectItem>
                          <SelectItem value="500k-1m" className="text-white hover:bg-white/10">$500K – $1M</SelectItem>
                          <SelectItem value="1m-2m" className="text-white hover:bg-white/10">$1M – $2M</SelectItem>
                          <SelectItem value="2m+" className="text-white hover:bg-white/10">$2M+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="financialOrganization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">How organized are your financial records?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-[#D4AF37]">
                            <SelectValue placeholder="Select organization level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0A1628] border-white/20">
                          <SelectItem value="very-organized" className="text-white hover:bg-white/10">Very organized</SelectItem>
                          <SelectItem value="somewhat-organized" className="text-white hover:bg-white/10">Somewhat organized</SelectItem>
                          <SelectItem value="needs-cleanup" className="text-white hover:bg-white/10">Needs cleanup</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}

            {/* Step 4: Operational Overview */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Operational overview
                </h3>
                <FormField
                  control={form.control}
                  name="customerConcentration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">What percentage of revenue comes from your largest customer?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-[#D4AF37]">
                            <SelectValue placeholder="Select percentage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0A1628] border-white/20">
                          <SelectItem value="under-10" className="text-white hover:bg-white/10">Under 10%</SelectItem>
                          <SelectItem value="10-25" className="text-white hover:bg-white/10">10% – 25%</SelectItem>
                          <SelectItem value="25-50" className="text-white hover:bg-white/10">25% – 50%</SelectItem>
                          <SelectItem value="over-50" className="text-white hover:bg-white/10">Over 50%</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ownerInvolvement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">How involved are you in daily operations or sales?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-[#D4AF37]">
                            <SelectValue placeholder="Select involvement level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0A1628] border-white/20">
                          <SelectItem value="very-involved" className="text-white hover:bg-white/10">Very involved</SelectItem>
                          <SelectItem value="somewhat-involved" className="text-white hover:bg-white/10">Somewhat involved</SelectItem>
                          <SelectItem value="minimally-involved" className="text-white hover:bg-white/10">Minimally involved</SelectItem>
                          <SelectItem value="not-involved" className="text-white hover:bg-white/10">Not involved</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}

            {/* Step 5: Timeline & Intent */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Timeline & intent
                </h3>
                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">What's your ideal timeline?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-[#D4AF37]">
                            <SelectValue placeholder="Select your timeline" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0A1628] border-white/20">
                          <SelectItem value="ready-now" className="text-white hover:bg-white/10">Ready now</SelectItem>
                          <SelectItem value="15-30-days" className="text-white hover:bg-white/10">Preferred close in 15–30 days</SelectItem>
                          <SelectItem value="3-6-months" className="text-white hover:bg-white/10">Preferred close in 3–6 months</SelectItem>
                          <SelectItem value="exploring" className="text-white hover:bg-white/10">Just exploring options</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Anything else we should know? (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Share any additional context about your business or goals..."
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#D4AF37] min-h-[100px] resize-none"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`${
                currentStep === 1
                  ? "opacity-0 pointer-events-none"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-gradient-to-r from-[#D4AF37] to-[#F4D77F] text-[#0A1628] font-semibold hover:opacity-90"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#D4AF37] to-[#F4D77F] text-[#0A1628] font-semibold hover:opacity-90 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit
                    <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default IntakeForm;
