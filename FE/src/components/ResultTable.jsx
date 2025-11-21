const ResultTable = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <div className="card">
      <h3>4. Bảng chi tiết kỹ thuật</h3>
      <table className="result-table">
        <thead>
          <tr>
            <th>Thuật toán</th>
            <th>Trạng thái</th>
            <th>Thời gian (ms)</th>
            <th>Mã băm (Hash Output)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td><b>{item.algo}</b></td>
              <td>
                <span className={`badge ${item.algo === 'MD5' || item.algo === 'SHA-1' ? 'badge-unsafe' : 'badge-safe'}`}>
                  {item.status}
                </span>
              </td>
              <td>{item.time.toFixed(3)}</td>
              <td><span className="hash-code" title={item.hash}>{item.hash}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ResultTable;