import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import MarketDetail from './pages/MarketDetail/MarketDetail';
import Portfolio from './pages/Portfolio/Portfolio';
import Activity from './pages/Activity/Activity';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/market/:id" element={<MarketDetail />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/activity" element={<Activity />} />
      </Routes>
    </Layout>
  );
}

export default App;

