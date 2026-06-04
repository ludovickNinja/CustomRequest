import { Route } from 'react-router-dom';
import FactoryHomePage from './pages/FactoryHomePage.jsx';

export default function factoryRoutes() {
  return [
    <Route key="factory-home" path="/factory" element={<FactoryHomePage />} />,
    <Route key="factory-catchall" path="/factory/*" element={<FactoryHomePage />} />,
  ];
}
