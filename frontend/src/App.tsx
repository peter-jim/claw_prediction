import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import MarketDetail from './pages/MarketDetail/MarketDetail';
import Portfolio from './pages/Portfolio/Portfolio';
import Admin from './pages/Admin/Admin';
import './App.css';

function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/market/:id" element={<MarketDetail />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </Layout>
    );
}

export default App;
