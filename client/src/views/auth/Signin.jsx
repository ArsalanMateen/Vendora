import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import auth from "../../auth/auth-helper";
import { signin } from "../../api/api-auth";
import Icon from "../../components/Icon";
import LoadingSpinner from "../../components/LoadingSpinner";
import AuthLayout from "./AuthLayout";
import styles from "./Auth.module.css";

export default function Signin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: "", password: "", error: "" });
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (name) => (event) =>
    setValues((previous) => ({
      ...previous,
      [name]: event.target.value,
      error: "",
    }));

  const performSignIn = async (email, password) => {
    setPending(true);
    const data = await signin({ email, password });
    setPending(false);
    if (data?.token && data?.user) {
      auth.authenticate(data, () => {
        const from = location.state?.from;
        navigate(
          from ? `${from.pathname}${from.search || ""}${from.hash || ""}` : "/",
          {
            replace: true,
          },
        );
      });
    } else {
      setValues((previous) => ({
        ...previous,
        error: data?.error || "We couldn’t sign you in. Please try again.",
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await performSignIn(values.email, values.password);
  };

  const handleDemoSignIn = async (email) => {
    const password = "VendoraDemo@2026";
    setValues({ email, password, error: "" });
    await performSignIn(email, password);
  };

  return (
    <AuthLayout>
      <p className="page-kicker">YOUR VENDORA ACCOUNT</p>
      <h1 className={styles.title}>Good to see you again.</h1>
      <p className={styles.subtitle}>Sign in and pick up where you left off.</p>
      {values.error && (
        <div className={styles.errorAlert} role="alert">
          {values.error}
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="signin-email" className={styles.label}>
            Email address
          </label>
          <input
            id="signin-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange("email")}
            required
            className={styles.input}
            placeholder="you@example.com"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="signin-password" className={styles.label}>
            Password
          </label>
          <div className={styles.passwordField}>
            <input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange("password")}
              required
              className={styles.input}
              placeholder="Enter your password"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((value) => !value)}
            >
              <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
            </button>
          </div>
        </div>
        <button type="submit" className={styles.btnSubmit} disabled={pending}>
          {pending ? <LoadingSpinner label="Signing you in" /> : "Sign in"}
        </button>
      </form>
      <div className={styles.divider} role="separator" aria-label="or">
        <span className={styles.dividerText}>or</span>
      </div>
      <p className={styles.demoText}>
        Sign in as{" "}
        <button
          type="button"
          className={styles.demoButton}
          disabled={pending}
          onClick={() => handleDemoSignIn("nathan.michel@users.vendora.test")}
          aria-label="Sign in as Nathan Michel"
          title="Nathan Michel: nathan.michel@users.vendora.test"
        >
          Nathan Michel
        </button>{" "}
        or{" "}
        <button
          type="button"
          className={styles.demoButton}
          disabled={pending}
          onClick={() => handleDemoSignIn("julia.pereira@users.vendora.test")}
          aria-label="Sign in as Julia Pereira"
          title="Julia Pereira: julia.pereira@users.vendora.test"
        >
          Julia Pereira
        </button>
      </p>
      <p className={styles.switchText}>
        New around here?{" "}
        <Link to="/signup" className={styles.switchLink}>
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
