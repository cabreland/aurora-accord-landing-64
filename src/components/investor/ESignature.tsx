import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PenTool, Clock, MapPin, CheckCircle } from 'lucide-react';

interface ESignatureProps {
  fullName: string;
  email: string;
  onSign: (signatureData: SignatureData) => void;
  className?: string;
}

export interface SignatureData {
  fullName: string;
  signedAt: string;
  ipAddress: string;
  userAgent: string;
  documentTitle: string;
}

export const ESignature: React.FC<ESignatureProps> = ({
  fullName,
  email,
  onSign,
  className = "",
}) => {
  const [signatureName, setSignatureName] = useState(fullName);
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  const handleSign = async () => {
    if (!signatureName.trim()) return;

    setIsSigning(true);
    
    try {
      // Get IP address (simplified - in production you'd get this from server)
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json() : null;
      const ipAddress = ipData?.ip || 'Unknown';

      const signatureData: SignatureData = {
        fullName: signatureName.trim(),
        signedAt: new Date().toISOString(),
        ipAddress,
        userAgent: navigator.userAgent,
        documentTitle: 'Non-Disclosure Agreement',
      };

      setIsSigned(true);
      onSign(signatureData);
    } catch (error) {
      console.error('Signing error:', error);
    } finally {
      setIsSigning(false);
    }
  };

  if (isSigned) {
    return (
      <Card className={`border-green-200 bg-green-50/50 ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Document Signed Successfully</p>
              <p className="text-sm text-green-600">
                Signed by {signatureName} on {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PenTool className="w-5 h-5" />
          Electronic Signature
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            By signing below, you acknowledge that you have read, understood, and agree to be bound by 
            the terms of this Non-Disclosure Agreement. Your electronic signature has the same legal 
            effect as a handwritten signature.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signature-name">Full Legal Name</Label>
            <Input
              id="signature-name"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Type your full legal name"
              className="text-lg font-medium"
            />
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
            <div className="text-center space-y-2">
              <div className="text-2xl font-script text-primary">
                {signatureName || 'Your Name Here'}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date().toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {email}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>By clicking "Sign Document" below, you agree that:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>This electronic signature is legally binding</li>
              <li>You are authorized to sign this document</li>
              <li>Your IP address and signing details will be recorded</li>
              <li>You have reviewed the complete agreement above</li>
            </ul>
          </div>

          <Button
            onClick={handleSign}
            disabled={!signatureName.trim() || isSigning}
            size="lg"
            className="w-full"
          >
            {isSigning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Signing Document...
              </>
            ) : (
              <>
                <PenTool className="w-4 h-4 mr-2" />
                Sign Document
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};