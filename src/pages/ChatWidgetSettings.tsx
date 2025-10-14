import React, { useState } from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AppearanceTab } from '@/components/settings/chat-widget/AppearanceTab';
import { BehaviorTab } from '@/components/settings/chat-widget/BehaviorTab';
import { MessagesTab } from '@/components/settings/chat-widget/MessagesTab';
import { ButtonConfigTab } from '@/components/settings/chat-widget/ButtonConfigTab';
import { InfoOptionsTab } from '@/components/settings/chat-widget/InfoOptionsTab';
import { SchedulingTab } from '@/components/settings/chat-widget/SchedulingTab';
import { NotificationsTab } from '@/components/settings/chat-widget/NotificationsTab';
import { WidgetPreview } from '@/components/settings/chat-widget/WidgetPreview';

const ChatWidgetSettings = () => {
  const { settings, loading, saving, updateSettings } = useWidgetSettings();
  const [activeTab, setActiveTab] = useState('appearance');

  if (loading) {
    return (
      <DashboardLayout activeTab="settings">
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (!settings) {
    return (
      <DashboardLayout activeTab="settings">
        <div className="text-center py-12">
          <p className="text-[hsl(var(--muted-foreground))]">No widget settings found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="settings">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Chat Widget Settings</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">
            Customize your chat widget appearance, behavior, and messaging
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Tabs */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-2">
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="behavior">Behavior</TabsTrigger>
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                    <TabsTrigger value="buttons">Buttons</TabsTrigger>
                    <TabsTrigger value="info-options">Info Options</TabsTrigger>
                    <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  </TabsList>

                  <div className="mt-6">
                    <TabsContent value="appearance">
                      <AppearanceTab 
                        settings={settings} 
                        onUpdate={updateSettings}
                        saving={saving}
                      />
                    </TabsContent>

                    <TabsContent value="behavior">
                      <BehaviorTab 
                        settings={settings} 
                        onUpdate={updateSettings}
                        saving={saving}
                      />
                    </TabsContent>

                    <TabsContent value="messages">
                      <MessagesTab 
                        settings={settings} 
                        onUpdate={updateSettings}
                        saving={saving}
                      />
                    </TabsContent>

                    <TabsContent value="buttons">
                      <ButtonConfigTab 
                        settings={settings} 
                        onUpdate={updateSettings}
                        saving={saving}
                      />
                    </TabsContent>

                    <TabsContent value="info-options">
                      <InfoOptionsTab 
                        settings={settings} 
                        onUpdate={updateSettings}
                        saving={saving}
                      />
                    </TabsContent>

                    <TabsContent value="scheduling">
                      <SchedulingTab 
                        settings={settings} 
                        onUpdate={updateSettings}
                        saving={saving}
                      />
                    </TabsContent>

                    <TabsContent value="notifications">
                      <NotificationsTab 
                        settings={settings} 
                        onUpdate={updateSettings}
                        saving={saving}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  See how your widget will appear to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WidgetPreview settings={settings} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatWidgetSettings;
