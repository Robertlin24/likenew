import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-purple-600">404</h1>
        <p className="text-xl text-gray-600">Page not found</p>
        <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
          <Home className="w-4 h-4" /> Back to Home
        </Button>
      </div>
    </div>
  );
}