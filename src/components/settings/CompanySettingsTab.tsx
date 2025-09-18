import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Save, Building, MapPin, Phone, Mail, Globe, Info } from 'lucide-react';
import { useRegistrationSettingsUnified } from '@/hooks/useRegistrationSettingsUnified';

interface CompanyAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface CompanyContact {
  phone: string;
  email: string;
  website: string;
}

export const CompanySettingsTab: React.FC = () => {
  const { loading, saving, updateSetting, getSetting } = useRegistrationSettingsUnified();
  
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState<CompanyAddress>({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA'
  });
  const [contact, setContact] = useState<CompanyContact>({
    phone: '',
    email: '',
    website: ''
  });

  useEffect(() => {
    if (!loading) {
      setCompanyName(getSetting('company_name', 'Exclusive Business Brokers, Inc.'));
      
      const addressData = getSetting('company_address', {
        street: '123 Business Ave',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA'
      });
      setAddress(addressData);

      const contactData = getSetting('company_contact', {
        phone: '+1 (555) 123-4567',
        email: 'legal@exclusivebb.com',
        website: 'https://exclusivebb.com'
      });
      setContact(contactData);
    }
  }, [loading]);

  const handleSave = async () => {
    await Promise.all([
      updateSetting('company_name', companyName),
      updateSetting('company_address', address),
      updateSetting('company_contact', contact),
    ]);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure your company information that will appear in legal documents and communications 
          with investors. This information will be used in NDA agreements and email signatures.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Name */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Legal Company Name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company Name, Inc."
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Legal Email
              </Label>
              <Input
                id="email"
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                placeholder="legal@yourcompany.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website
              </Label>
              <Input
                id="website"
                value={contact.website}
                onChange={(e) => setContact({ ...contact, website: e.target.value })}
                placeholder="https://yourcompany.com"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Business Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                placeholder="New York"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                placeholder="NY"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">ZIP/Postal Code</Label>
              <Input
                id="zip"
                value={address.zip}
                onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                placeholder="10001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                placeholder="USA"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          size="lg"
          className="flex items-center gap-2"
        >
          {saving ? (
            <LoadingSpinner className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Company Information
        </Button>
      </div>
    </div>
  );
};