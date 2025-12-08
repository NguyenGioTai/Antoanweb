import styled from 'styled-components';

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  border: 2px solid ${({ theme }) => theme.colors.secondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

const AttackButton = styled.button`
  background-color: ${({ color }) => color};
  color: white;

  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }
`;

const ResultBox = styled.div`
  background: #f3e5f5;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 8px;
  margin-top: ${({ theme }) => theme.spacing.lg};

  p {
    margin: 0;
  }

  ul {
    padding-left: 20px;
    margin-top: 10px;
  }
`;

const algorithms = [
  { name: 'MD5', color: '#e74c3c' },
  { name: 'SHA-1', color: '#f39c12' },
  { name: 'PBKDF2', color: '#27ae60' },
  { name: 'Bcrypt', color: '#2980b9' },
  { name: 'Argon2', color: '#8e44ad' },
];

const AttackSection = ({ handleAttack, attackResult, attacking }) => {
  
  const getAttackingMessage = () => {
    if (!attacking) return null;

    const baseMessage = `⚠️ Đang tấn công ${attacking} với 100 lần thử...`;

    if (attacking === 'Argon2') {
      return `${baseMessage} (Argon2 được thiết kế để tốn nhiều bộ nhớ và sẽ rất lâu, hãy kiên nhẫn!)`;
    }
    if (attacking === 'Bcrypt' || attacking === 'PBKDF2') {
      return `${baseMessage} (Quá trình này sẽ mất một chút thời gian.)`;
    }
    return baseMessage;
  };

  return (
    <Card>
      <h3>4. Mô phỏng Tấn công (100 Passwords)</h3>
      <p>Server sẽ thử giải mã 100 mật khẩu sai liên tiếp. Xem hệ thống chịu tải ra sao.</p>
      
      <ButtonGroup>
        {algorithms.map(algo => (
          <AttackButton 
            key={algo.name}
            color={algo.color}
            onClick={() => handleAttack(algo.name)} 
            disabled={!!attacking}
          >
            Tấn công {algo.name}
          </AttackButton>
        ))}
      </ButtonGroup>

      {attacking && <div style={{color: '#8e44ad', fontWeight: 'bold'}}>{getAttackingMessage()}</div>}

      {attackResult && (
        <ResultBox>
          <p><b>Kết quả tấn công {attackResult.algo}:</b></p>
          <ul>
            <li>Số lượng mật khẩu thử: <b>{attackResult.attempts}</b></li>
            <li>Tổng thời gian: <b>{attackResult.totalTime.toFixed(2)} ms</b></li>
            <li>Trung bình mỗi pass: <b>{attackResult.avgTime.toFixed(2)} ms</b></li>
          </ul>
        </ResultBox>
      )}
    </Card>
  );
};

export default AttackSection;