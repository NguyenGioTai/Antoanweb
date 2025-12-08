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
  align-items: center;

  input {
    flex: 1;
  }

  button {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primaryHover};
    }
  }
`;

const BenchmarkSection = ({ password, setPassword, handleBenchmark, loading }) => {
  return (
    <Card>
      <h3>1. Khởi tạo & Benchmark</h3>
      <InputGroup>
        <input 
          type="text" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Nhập mật khẩu gốc..." 
        />
        <button onClick={handleBenchmark} disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Chạy & Lưu DB'}
        </button>
      </InputGroup>
    </Card>
  );
};

export default BenchmarkSection;