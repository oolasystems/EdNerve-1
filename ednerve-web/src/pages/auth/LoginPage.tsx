
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import axios from "axios";

import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/brand/oolaednerve-logo.svg";

function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login({
        email: email.trim(),
        password,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const validationMessage =
          error.response?.data?.errors?.email?.[0];

        setErrorMessage(
          validationMessage ||
          error.response?.data?.message ||
          "Unable to sign in. Please check your credentials."
        );
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="page-card auth-card">

        {/* OolaEdNerve Brand Header */}
        <div className="auth-brand">
          <img src={logo} alt="OolaEdNerve - Higher Education ERP Platform" />
        </div>

        {/* Login Heading */}
        <div className="page-heading">
          <h1>Welcome back</h1>

          <p>
            Sign in to access the OolaEdNerve Platform
            Administration Portal.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">

          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>

            <div className="form-control-wrapper">
              <Mail
                size={19}
                className="form-control-icon"
              />

              <input
                id="email"
                type="email"
                className="form-control form-control-with-icon"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>

            <div className="form-control-wrapper">
              <LockKeyhole
                size={19}
                className="form-control-icon"
              />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-control form-control-with-icon"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                disabled={isSubmitting}
              />

              <button
                type="button"
                className="form-control-action"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          {/* Authentication Error */}
          {errorMessage && (
            <div className="alert alert-error" role="alert">
              {errorMessage}
            </div>
          )}

          {/* Sign In */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>

        </form>

        {/* Security Note */}
        <div className="auth-security-note">
          <LockKeyhole size={15} />
          <span>Secure Platform Administrator Access</span>
        </div>

      </div>

      {/* Footer */}
      <footer className="auth-footer">
        © {new Date().getFullYear()} Oola Systems. All rights reserved.
      </footer>

    </div>
  );
}

export default LoginPage;
