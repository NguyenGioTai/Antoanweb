import { useState } from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const InputGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  align-items: center;

  input {
    flex-grow: 1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
`;

const VerifyButton = styled.button`
  background-color: ${({ color }) => color};
  color: white;

  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }
`;

const ResultBox = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: 4px;
  background-color: ${({ valid }) => valid ? '#e8f5e9' : '#ffebee'};
  color: ${({ valid }) => valid ? '#2e7d32' : '#c62828'};
  font-weight: bold;
`;

const algorithms = [
  { name: 'MD5', color: '#e74c3c' },
  { name: 'SHA-1', color: '#f39c12' },
  { name: 'Bcrypt', color: '#2980b9' },
  { name: 'Argon2', color: '#8e44ad' },
];

const VerifySection = ({ handleVerify, verifyResult, verifying }) => {
  const [password, setPassword] = useState('');

  const onVerify = (algo) => {
    if (password) {
      handleVerify(password, algo);
    } else {
      alert('Vui lòng nhập mật khẩu để kiểm tra!');
    }
  };

  return (
    <Card>
      <h3>2. Xác thực (Giả lập Login)</h3>
      <InputGroup>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Nhập mật khẩu để xác thực..."
        />
      </InputGroup>

      <ButtonGroup>
        {algorithms.map(algo => (
          <VerifyButton 
            key={algo.name}
            color={algo.color}
            onClick={() => onVerify(algo.name)}
            disabled={verifying}
          >
            {verifying === algo.name ? 'Đang check...' : `Check với ${algo.name}`}
          </VerifyButton>
        ))}
      </ButtonGroup>

      {verifyResult && (
        <ResultBox valid={verifyResult.valid}>
          <p>{verifyResult.msg} (Thời gian: {verifyResult.time}ms)</p>
        </ResultBox>
      )}
    </Card>
  );
};

export default VerifySection;
