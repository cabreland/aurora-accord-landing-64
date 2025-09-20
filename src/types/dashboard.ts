export interface DashboardWidget {
  id: string;
  type: 'deals' | 'pipeline' | 'actions' | 'activity' | 'nda';
  title: string;
  description: string;
  visible: boolean;
  order: number;
  locked?: boolean;
}