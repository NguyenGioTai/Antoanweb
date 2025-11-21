const AttackSection = ({ handleAttack, attackResult, attacking }) => {
  return (
    <div className="card" style={{border: '2px solid #8e44ad'}}>
      <h3>3. Mô phỏng Tấn công (100 Passwords)</h3>
      <p>Server sẽ thử giải mã 100 mật khẩu sai liên tiếp. Xem hệ thống chịu tải ra sao.</p>
      
      <div style={{display: 'flex', gap: '10px', margin: '15px 0', justifyContent: 'center'}}>
        <button 
          style={{backgroundColor: '#e74c3c'}} 
          onClick={() => handleAttack('MD5')} 
          disabled={attacking}
        >
          Tấn công MD5
        </button>
        <button 
          style={{backgroundColor: '#3498db'}} 
          onClick={() => handleAttack('Argon2')} 
          disabled={attacking}
        >
          Tấn công Argon2
        </button>
      </div>

      {attacking && <div style={{color: '#8e44ad', fontWeight: 'bold'}}>⚠️ Đang thực hiện 100 lần thử... (Argon2 sẽ rất lâu)</div>}

      {attackResult && (
        <div style={{background: '#f3e5f5', padding: '15px', borderRadius: '8px'}}>
          <p><b>Kết quả tấn công {attackResult.algo}:</b></p>
          <ul>
            <li>Số lượng mật khẩu thử: <b>{attackResult.attempts}</b></li>
            <li>Tổng thời gian: <b>{attackResult.totalTime.toFixed(2)} ms</b></li>
            <li>Trung bình mỗi pass: <b>{attackResult.avgTime.toFixed(2)} ms</b></li>
          </ul>
        </div>
      )}
    </div>
  );
};
export default AttackSection;