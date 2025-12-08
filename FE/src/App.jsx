import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./styles/GlobalStyles";
import { theme } from "./styles/theme";
import { useStore } from "./store";
import styled from "styled-components";

import BenchmarkSection from "./components/BenchmarkSection";
import ResultTable from "./components/ResultTable";
import AttackSection from "./components/AttackSection";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  h1 {
    font-size: 3rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
  }

  p {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

function App() {
  const {
    password,
    data,
    loading,
    attacking,
    attackResult,
    setPassword,
    handleBenchmark,
    handleAttack,
  } = useStore();

  const chartData = {
    labels: data.map((d) => d.algo),
    datasets: [
      {
        label: "Thời gian (ms)",
        data: data.map((d) => d.time),
        backgroundColor: [
          theme.colors.danger,
          theme.colors.warning,
          theme.colors.success,
          theme.colors.primary,
        ],
      },
    ],
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Container>
        <Header>
          <h1>Professional Secure Storage Demo</h1>
          <p>Mô hình MVC - MongoDB - Attack Simulation (100x)</p>
        </Header>

        <BenchmarkSection
          password={password}
          setPassword={setPassword}
          handleBenchmark={() => handleBenchmark(password)}
          loading={loading || attacking}
        />

        {data.length > 0 && (
          <>
            <Card>
              <h3>2. Biểu đồ hiệu năng</h3>
              <div style={{ height: "300px" }}>
                <Bar
                  data={chartData}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            </Card>

            <ResultTable data={data} />

            <AttackSection
              handleAttack={handleAttack}
              attackResult={attackResult}
              attacking={attacking}
            />
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
