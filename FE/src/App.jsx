// client/src/App.jsx
import { useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const handleBenchmark = async () => {
    if (!password) return alert("Vui lòng nhập mật khẩu!");
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/benchmark', { password });
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối server Backend!");
    } finally {
      setLoading(false);
    }
  };

  // Cấu hình biểu đồ
  const chartData = {
    labels: data.map(d => d.algo),
    datasets: [{
      label: 'Thời gian xử lý (mili-giây)',
      data: data.map(d => d.time),
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)', // MD5
        'rgba(255, 159, 64, 0.7)', // SHA1
        'rgba(75, 192, 192, 0.7)', // Bcrypt
        'rgba(54, 162, 235, 0.7)', // Argon2
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
      ],
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'So sánh hiệu năng Hashing (Càng cao = Càng an toàn)' },
    },
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Secure Password Storage Demo</h1>
        <p>So sánh thời gian thực thi giữa các thuật toán Hashing</p>
      </div>

      <div className="card">
        <h3>1. Nhập mật khẩu giả lập</h3>
        <div className="input-group">
          <input 
            type="text" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Nhập mật khẩu..."
          />
          <button onClick={handleBenchmark} disabled={loading}>
            {loading ? 'Đang tính toán...' : 'Chạy Demo'}
          </button>
        </div>
      </div>

      {data.length > 0 && (
        <>
          <div className="card">
            <h3>2. Biểu đồ trực quan</h3>
            <p style={{fontSize: '14px', color: '#666'}}>
              * Lưu ý: MD5/SHA1 cực nhanh (gần như bằng 0 trên biểu đồ) nên rất dễ bị Brute-force.
            </p>
            <div className="chart-container">
              <Bar options={chartOptions} data={chartData} />
            </div>
          </div>

          <div className="card">
            <h3>3. Chi tiết kỹ thuật</h3>
            <table className="result-table">
              <thead>
                <tr>
                  <th>Thuật toán</th>
                  <th>Trạng thái</th>
                  <th>Thời gian (ms)</th>
                  <th>Chuỗi băm (Output)</th>
                  <th>Giải thích</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td><strong>{item.algo}</strong></td>
                    <td>
                      <span className={`badge ${item.algo === 'Argon2' ? 'badge-best' : item.algo === 'Bcrypt' ? 'badge-safe' : 'badge-unsafe'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{fontWeight: 'bold', color: '#333'}}>{item.time.toFixed(3)} ms</td>
                    <td><span className="hash-code" title={item.hash}>{item.hash}</span></td>
                    <td style={{fontSize: '13px'}}>{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default App;