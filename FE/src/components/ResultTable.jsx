import styled from 'styled-components';

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px 15px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
    white-space: nowrap;
  }

  th {
    background-color: ${({ theme }) => theme.colors.lightGrey};
    font-weight: 600;
  }

  td {
    font-size: 14px;
  }
`;

const HashCell = styled.td`
  font-family: ${({ theme }) => theme.fonts.monospace};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.secondary};
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Badge = styled.span`
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background-color: ${({ color }) => color};
`;

const getBadgeColor = (status) => {
  if (status === 'Rất nguy hiểm') return '#e74c3c';
  if (status === 'Nguy hiểm') return '#f39c12';
  if (status === 'An toàn') return '#27ae60';
  if (status === 'Rất an toàn') return '#2980b9';
  if (status === 'Khuyến nghị') return '#8e44ad';
  return '#7f8c8d';
};

const ResultTable = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <Card>
      <h3>4. Bảng chi tiết kỹ thuật</h3>
      <Table>
        <thead>
          <tr>
            <th>Thuật toán</th>
            <th>Thời gian (ms)</th>
            <th>Mã băm (Hash Output)</th>
            <th>Salt</th>
            <th>Số lần lặp</th>
            <th>Chi phí bộ nhớ</th>
            <th>Độ song song</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td><b>{item.algo}</b></td>
              <td>{item.time.toFixed(3)}</td>
              <HashCell title={item.hash}>{item.hash}</HashCell>
              <HashCell title={item.salt}>{item.salt}</HashCell>
              <td>{item.iterations}</td>
              <td>{item.memoryCost}</td>
              <td>{item.parallelism}</td>
              <td>
                <Badge color={getBadgeColor(item.status)}>
                  {item.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default ResultTable;