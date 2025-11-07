import { jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";


const mockPost = jest.fn();
const mockFire = jest.fn();
const mockError = jest.fn();


jest.unstable_mockModule("axios", () => ({
  default: { post: mockPost },
}));

jest.unstable_mockModule("sweetalert2", () => ({
  default: { fire: mockFire },
}));

jest.unstable_mockModule("react-hot-toast", () => ({
  default: { error: mockError },
}));

const { default: axios } = await import("axios");
const { default: Swal } = await import("sweetalert2");
const { default: toast } = await import("react-hot-toast");
const { default: Login } = await import("../pages/Login/Login");

describe("Login Page Functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("logs in successfully", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        user: { id: "123" },
        token: "mock_token",
        message: "Login successful",
      },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "http://localhost:5000/api/users/login",
        { email: "test@example.com", password: "123456" }
      );

      expect(localStorage.getItem("user_id")).toBe("123");
      expect(localStorage.getItem("token")).toBe("mock_token");
      expect(mockFire).toHaveBeenCalledWith(
        "Success!",
        "Login successful",
        "success"
      );
    });
  });

  test("shows error message on failed login", async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "fail@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
      expect(mockError).toHaveBeenCalledWith("Invalid credentials");
      // error should also appear on screen
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
