import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    background-color: ${theme.colors.background};
    color: ${theme.colors.textPrimary};
    font-family: ${theme.fonts.body};
    margin: 0;
    padding: ${theme.spacing.lg};
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.fonts.heading};
    color: ${theme.colors.primary};
    margin-top: 0;
  }

  p {
    line-height: 1.6;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: ${theme.colors.primaryHover};
    }
  }

  button {
    cursor: pointer;
    border-radius: 10px;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.3s ease;
    border: none;
    padding: 12px 24px;
  }

  input, select {
    border-radius: 10px;
    border: 2px solid ${theme.colors.border};
    padding: 12px;
    font-size: 16px;
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
    }
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: ${theme.borderRadius};
    overflow: hidden;
    box-shadow: ${theme.shadows.sm};
  }

  th, td {
    padding: ${theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${theme.colors.border};
  }

  th {
    background-color: ${theme.colors.lightGrey};
    font-weight: 600;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;
