import React from 'react';

interface DataRoomEmptySectionProps {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function DataRoomEmptySection({ icon, title, description, action }: DataRoomEmptySectionProps) {
  return (
    <div className="text-center py-12 bg-card border border-border rounded-lg">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
