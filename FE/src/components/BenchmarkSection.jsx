const BenchmarkSection = ({ password, setPassword, handleBenchmark, loading }) => {
  return (
    <div className="card">
      <h3>1. Khởi tạo & Benchmark</h3>
      <div className="input-group">
        <input 
          type="text" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Nhập mật khẩu gốc..." 
        />
        <button onClick={handleBenchmark} disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Chạy & Lưu DB'}
        </button>
      </div>
    </div>
  );
};
export default BenchmarkSection;