import React from 'react';
import { WidgetConfig } from '@/types/dashboard';
import { DEFAULT_WIDGET_CONFIGS } from '@/config/dashboardConfig';

// Widget components
import { MyDealsWidget } from '../widgets/MyDealsWidget';
import { PipelineWidget } from '../widgets/PipelineWidget';
import { QuickActionsWidget } from '../widgets/QuickActionsWidget';
import { ActivityFeedWidget } from '../widgets/ActivityFeedWidget';
import { MetricsWidget } from '../widgets/MetricsWidget';
import { NDAWidget } from '../widgets/NDAWidget';

class WidgetRegistry {
  private widgets: Map<string, WidgetConfig> = new Map();
  private components: Map<string, React.ComponentType<any>> = new Map();

  constructor() {
    this.registerDefaultWidgets();
  }

  private registerDefaultWidgets() {
    // Register component mappings
    this.components.set('metrics', MetricsWidget);
    this.components.set('deals', MyDealsWidget);
    this.components.set('pipeline', PipelineWidget);
    this.components.set('actions', QuickActionsWidget);
    this.components.set('activity', ActivityFeedWidget);
    this.components.set('nda', NDAWidget);

    // Register widget configurations
    DEFAULT_WIDGET_CONFIGS.forEach(config => {
      const component = this.components.get(config.id);
      if (component) {
        this.registerWidget({
          ...config,
          component
        });
      }
    });
  }

  registerWidget(config: WidgetConfig): void {
    this.widgets.set(config.id, config);
  }

  unregisterWidget(id: string): void {
    this.widgets.delete(id);
  }

  getWidget(id: string): WidgetConfig | undefined {
    return this.widgets.get(id);
  }

  getAllWidgets(): WidgetConfig[] {
    return Array.from(this.widgets.values());
  }

  getWidgetsByCategory(category: string): WidgetConfig[] {
    return this.getAllWidgets().filter(widget => 
      widget.meta.category === category
    );
  }

  getWidgetComponent(id: string): React.ComponentType<any> | null {
    const widget = this.getWidget(id);
    return widget?.component || null;
  }

  isWidgetRegistered(id: string): boolean {
    return this.widgets.has(id);
  }

  getWidgetMeta(id: string) {
    const widget = this.getWidget(id);
    return widget?.meta;
  }

  getWidgetConstraints(id: string) {
    const widget = this.getWidget(id);
    return widget?.constraints;
  }

  // Dynamic widget registration for future extensibility
  registerDynamicWidget(
    id: string,
    component: React.ComponentType<any>,
    config: Omit<WidgetConfig, 'id' | 'component'>
  ): void {
    this.registerWidget({
      id,
      component,
      ...config
    });
  }
}

// Singleton instance
export const widgetRegistry = new WidgetRegistry();

// React hook for accessing registry
export const useWidgetRegistry = () => {
  return {
    getWidget: (id: string) => widgetRegistry.getWidget(id),
    getAllWidgets: () => widgetRegistry.getAllWidgets(),
    getWidgetsByCategory: (category: string) => widgetRegistry.getWidgetsByCategory(category),
    getWidgetComponent: (id: string) => widgetRegistry.getWidgetComponent(id),
    isWidgetRegistered: (id: string) => widgetRegistry.isWidgetRegistered(id),
    getWidgetMeta: (id: string) => widgetRegistry.getWidgetMeta(id),
    getWidgetConstraints: (id: string) => widgetRegistry.getWidgetConstraints(id)
  };
};

export default widgetRegistry;