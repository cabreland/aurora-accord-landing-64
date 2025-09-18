import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PasswordStrength } from '@/components/ui/password-strength';
import { UserPlus, Building, Phone, Mail, User } from 'lucide-react';
import { InvitationDetails } from '@/hooks/useInvitationValidation';

const registrationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, numbers, and special characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().optional(),
  phoneNumber: z.string().optional(),
  investorType: z.enum(['individual', 'fund', 'institution', 'family_office', 'other'], {
    required_error: 'Please select an investor type',
  }),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface InvestorRegistrationFormProps {
  invitation: InvitationDetails;
  onComplete: (data: RegistrationFormData) => void;
}

export const InvestorRegistrationForm: React.FC<InvestorRegistrationFormProps> = ({
  invitation,
  onComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: invitation.email,
      password: '',
      firstName: '',
      lastName: '',
      companyName: invitation.company_name || '',
      phoneNumber: '',
      investorType: 'individual',
    },
  });

  const handleSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    try {
      // Validate form data
      await registrationSchema.parseAsync(data);
      onComplete(data);
    } catch (error) {
      console.error('Registration validation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const investorTypeOptions = [
    { value: 'individual', label: 'Individual Investor' },
    { value: 'fund', label: 'Investment Fund' },
    { value: 'institution', label: 'Institution' },
    { value: 'family_office', label: 'Family Office' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Create Your Investor Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Email (read-only) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email" 
                      readOnly 
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your first name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your last name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="password" 
                      placeholder="Create a strong password"
                    />
                  </FormControl>
                  <PasswordStrength password={field.value} className="mt-2" />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Optional Fields */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground">
                Additional Information (Optional)
              </h3>
              
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Company Name
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your company or firm name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+1 (555) 123-4567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investorType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investor Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your investor type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {investorTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                'Continue to NDA Acceptance'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};