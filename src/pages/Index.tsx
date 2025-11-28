import { Navigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';

const Index = () => {
  const currentUser = useStore(state => state.currentUser);
  
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/" replace />;
};

export default Index;
