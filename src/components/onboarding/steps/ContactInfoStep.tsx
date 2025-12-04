import React, { useEffect } from 'react';
import { Mail, Phone, Building2, Linkedin, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { OnboardingFormData } from '@/pages/InvestorOnboardingNew';

interface ContactInfoStepProps {
  data: OnboardingFormData;
  updateData: (data: Partial<OnboardingFormData>) => void;
  setIsValid: (valid: boolean) => void;
}

export const ContactInfoStep = ({ data, updateData, setIsValid }: ContactInfoStepProps) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return url.includes('linkedin.com');
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (data.fullName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!data.email) {
      newErrors.email = 'Email is required';
    }

    if (!data.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(data.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (data.companyName.length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters';
    }

    if (data.linkedinUrl && !validateUrl(data.linkedinUrl)) {
      newErrors.linkedinUrl = 'Please enter a valid LinkedIn URL';
    }

    setErrors(newErrors);
    const valid = Object.keys(newErrors).length === 0 && 
      data.fullName.length >= 2 && 
      data.phone.length > 0 && 
      data.companyName.length >= 2;
    setIsValid(valid);
  }, [data, setIsValid]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
      <p className="text-gray-600 mb-8">Let's start with your basic information</p>

      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-2 block">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="fullName"
              type="text"
              value={data.fullName}
              onChange={(e) => updateData({ fullName: e.target.value })}
              onBlur={() => handleBlur('fullName')}
              placeholder="John Smith"
              className={`h-12 pl-10 rounded-lg border-gray-300 focus:border-[#D4AF37] focus:ring-[#D4AF37] ${
                touched.fullName && errors.fullName ? 'border-red-500' : ''
              }`}
            />
          </div>
          {touched.fullName && errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={data.email}
              readOnly
              className="h-12 pl-10 rounded-lg bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed"
            />
          </div>
          <p className="text-gray-500 text-xs mt-1">Email from your account</p>
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => updateData({ phone: e.target.value })}
              onBlur={() => handleBlur('phone')}
              placeholder="+1 (555) 123-4567"
              className={`h-12 pl-10 rounded-lg border-gray-300 focus:border-[#D4AF37] focus:ring-[#D4AF37] ${
                touched.phone && errors.phone ? 'border-red-500' : ''
              }`}
            />
          </div>
          {touched.phone && errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Company Name */}
        <div>
          <Label htmlFor="companyName" className="text-sm font-medium text-gray-700 mb-2 block">
            Company Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="companyName"
              type="text"
              value={data.companyName}
              onChange={(e) => updateData({ companyName: e.target.value })}
              onBlur={() => handleBlur('companyName')}
              placeholder="Acme Holdings LLC"
              className={`h-12 pl-10 rounded-lg border-gray-300 focus:border-[#D4AF37] focus:ring-[#D4AF37] ${
                touched.companyName && errors.companyName ? 'border-red-500' : ''
              }`}
            />
          </div>
          {touched.companyName && errors.companyName && (
            <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
          )}
        </div>

        {/* LinkedIn */}
        <div>
          <Label htmlFor="linkedinUrl" className="text-sm font-medium text-gray-700 mb-2 block">
            LinkedIn Profile <span className="text-gray-400">(optional)</span>
          </Label>
          <div className="relative">
            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="linkedinUrl"
              type="url"
              value={data.linkedinUrl}
              onChange={(e) => updateData({ linkedinUrl: e.target.value })}
              onBlur={() => handleBlur('linkedinUrl')}
              placeholder="https://linkedin.com/in/yourprofile"
              className={`h-12 pl-10 rounded-lg border-gray-300 focus:border-[#D4AF37] focus:ring-[#D4AF37] ${
                touched.linkedinUrl && errors.linkedinUrl ? 'border-red-500' : ''
              }`}
            />
          </div>
          {touched.linkedinUrl && errors.linkedinUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.linkedinUrl}</p>
          )}
        </div>
      </div>
    </div>
  );
};
