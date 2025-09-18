import React from 'react';

const TestRegistration = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test Registration Page</h1>
        <p>This page is working! The deployment is successful.</p>
        <p className="text-sm text-muted-foreground mt-4">
          URL: {window.location.href}
        </p>
      </div>
    </div>
  );
};

export default TestRegistration;