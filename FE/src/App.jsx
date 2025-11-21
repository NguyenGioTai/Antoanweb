import { useState } from 'react';
import axios from 'axios';
import BenchmarkSection from './components/BenchmarkSection';
import ResultTable from './components/ResultTable';
import AttackSection from './components/AttackSection';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './App.css'; // File CSS cũ của bạn

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [password, setPassword] = useState('Admin@123');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Attack State
  const [attackResult, setAttackResult] = useState(null);
  const [attacking, setAttacking] = useState(false);

  const handleBenchmark = async () => {
    if (!password) return alert("Nhập pass!");
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/benchmark', { password });
      setData(res.data);
    } catch (e) { alert("Lỗi Server!"); }
    finally { setLoading(false); }
  };

  const handleAttack = async (algo) => {
    setAttacking(true);
    setAttackResult(null);
    try {
      // Lưu ý: Argon2 100 lần sẽ mất khoảng 30-40 giây
      const res = await axios.post('http://localhost:3000/api/attack', { algo });
      setAttackResult(res.data);
    } catch (e) { alert("Lỗi Attack!"); }
    finally { setAttacking(false); }
  };

  // Chart Data
  const chartData = {
    labels: data.map(d => d.algo),
    datasets: [{
      label: 'Thời gian (ms)',
      data: data.map(d => d.time),
      backgroundColor: ['#e74c3c', '#e67e22', '#1abc9c', '#3498db']
    }]
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Professional Secure Storage Demo</h1>
        <p>Mô hình MVC - MongoDB - Attack Simulation (100x)</p>
      </div>

      <BenchmarkSection
        password={password}
        setPassword={setPassword}
        handleBenchmark={handleBenchmark}
        loading={loading}
      />

      {data.length > 0 && (
        <>
          <div className="card">
            <h3>2. Biểu đồ hiệu năng</h3>
            <div className="chart-container" style={{ height: '300px' }}>
              <Bar data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <ResultTable data={data} />

          <AttackSection
            handleAttack={handleAttack}
            attackResult={attackResult}
            attacking={attacking}
          />


        </>
      )}
    </div>
  );
}

export default App;