import React, { useState } from 'react';
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

const ChatWidgetSettingsTab = () => {
  const { settings, loading, saving, updateSettings } = useWidgetSettings();
  const [activeTab, setActiveTab] = useState('appearance');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No widget settings found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Chat Widget Configuration</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your chat widget appearance, behavior, and messaging
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Tabs */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-1">
                  <TabsTrigger value="appearance" className="text-xs">Appearance</TabsTrigger>
                  <TabsTrigger value="behavior" className="text-xs">Behavior</TabsTrigger>
                  <TabsTrigger value="messages" className="text-xs">Messages</TabsTrigger>
                  <TabsTrigger value="buttons" className="text-xs">Buttons</TabsTrigger>
                  <TabsTrigger value="info-options" className="text-xs">Info</TabsTrigger>
                  <TabsTrigger value="scheduling" className="text-xs">Scheduling</TabsTrigger>
                  <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
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
                See how your widget will appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WidgetPreview settings={settings} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatWidgetSettingsTab;
