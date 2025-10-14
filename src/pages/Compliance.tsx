import React from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Compliance = () => {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Compliance & Legal</h1>
          <p className="text-muted-foreground">NDA status, document access, and legal compliance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-8 h-8 text-green-500" />
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">5</div>
              <div className="text-sm text-muted-foreground">NDAs Signed</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-orange-500" />
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">2</div>
              <div className="text-sm text-muted-foreground">Pending NDAs</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle2 className="w-8 h-8 text-blue-500" />
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-foreground">100%</div>
              <div className="text-sm text-muted-foreground">Compliance Rate</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>NDA Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { company: 'TechFlow Solutions', status: 'signed', date: '2024-01-15' },
                { company: 'Green Energy Corp', status: 'signed', date: '2024-01-12' },
                { company: 'MedDevice Innovations', status: 'pending', date: '-' },
                { company: 'DataSecure Analytics', status: 'signed', date: '2024-01-10' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-foreground">{item.company}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.status === 'signed' ? `Signed on ${item.date}` : 'Awaiting signature'}
                      </div>
                    </div>
                  </div>
                  <Badge className={item.status === 'signed' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}>
                    {item.status === 'signed' ? 'Signed' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Compliance;
