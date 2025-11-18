
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { AlertTriangle, Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const showSidebar = window.location.hash !== "#/";
  
  return (
    <div className={`flex flex-col items-center justify-center ${showSidebar ? 'h-full' : 'h-screen'}`}>
      <AlertTriangle className="w-16 h-16 text-severity-medium mb-4" />
      <h1 className="text-4xl font-bold text-white mb-2">404 - Endpoint Not Found</h1>
      <p className="text-gray-400 mb-8">The resource you are looking for does not exist or has been moved.</p>
      <div className="flex space-x-4">
        <Link to="/dashboard">
          <Button variant="primary" icon={Home}>Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
