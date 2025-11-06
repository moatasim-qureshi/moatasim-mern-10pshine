import { render, screen } from "@testing-library/react";
import App from "../App.jsx";
import "@testing-library/jest-dom";

test("renders the login page correctly", () => {
  render(
      <App />
  );

  // Check key UI elements from your screenshot
  expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
});
