import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Layout } from './components/Layout';
import { Students } from './pages/Students';
import { Classes } from './pages/Classes';
import { Evaluations } from './pages/Evaluations';
import './index.css';

function App() {
  return (
    <Router>
      <Navigation />
      <Layout>
        <Routes>
          <Route path="/" element={<Students />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/evaluations" element={<Evaluations />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
