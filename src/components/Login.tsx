import { useState, useEffect } from "react";

import "../styles/login.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Props = {
  onLogin: (email: string, password: string) => Promise<{ success: boolean}>;
  onRegister?: (email: string, password: string, name: string, username: string) => Promise<{ success: boolean}>;
  onGuestJoin?: () => void;
};

export default function LoginPopup({ onLogin, onRegister, onGuestJoin }: Props) {
  let isLoggedIn = false;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [registerMode, setRegisterMode] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [awaitingCode, setAwaitingCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // CHECK IF USER IS RESETTING PASSWORD
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("resetToken");

    if (token) {
      setResetToken(token);
      setResetPasswordMode(true);
    }
  }, []);

  function clearFields() {
    setEmail("");
    setPassword("");
    setName("");
    setUsername("");
    setSubmitted(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (resetPasswordMode && resetToken) {
    const res = await fetch("https://trenchsocial-backend.onrender.com/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, password: newPassword }),
    });

    if (res.ok) {
      toast.success("Password updated!");
      setResetPasswordMode(false);
      setResetToken(null);
      window.history.replaceState({}, document.title, "/"); // remove query param
      clearFields();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to reset password");
    }
    return;
  }

  if (forgotMode) {
    onForgotPassword(email);
    setSubmitted(true);
    return;
  } 
  if (registerMode && onRegister) {

    if (!awaitingCode) {
      const rsp = await fetch("https://trenchsocial-backend.onrender.com/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (rsp.ok) {
        setAwaitingCode(true);
        toast.success("Verification code sent to email");
      } else {
        toast.error("Failed to send code.");
      }
      return;
    }

    if (awaitingCode) {
      const rsp = await fetch("https://trenchsocial-backend.onrender.com/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode })
      });

      const data = await rsp.json();
      if (data.success) {
        toast.success("Code verified ✔️");

        const result = await onRegister(email, password, name, username);
        if (result.success) {
          setForgotMode(false);
          setRegisterMode(false);
          setAwaitingCode(false);
          clearFields();
        }
      } else {
        toast.error(data.error || "Invalid / expired code");
      }
      return;
    }

    return;
  } 
  else {
    const result = await onLogin(email, password);
    if (result.success) {
      setTimeout(() => {
        setForgotMode(false);
        setRegisterMode(false);
        setSubmitted(false);
        clearFields();
      }, 2000);
    }
  }
};

const onForgotPassword = async (email: string) => {
  const rsp = await fetch("https://trenchsocial-backend.onrender.com/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (rsp.ok) {
    toast.success("Reset link sent if email exists");
  } else {
    toast.error("Failed to send reset link");
  }
};


  return (
    <div className="popup-backdrop">
      <div className="popup-box">

        <span>
            {forgotMode ? (
                "Reset your password"
            ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <img
                    src="/trench-social2.png"
                    alt="TrenchSocial"
                    style={{ width: "20rem", height: "auto", paddingBottom: "0.5rem" }}
                    />
                    <span style={{ fontSize: "0.9rem", color: "#777", textAlign: "center" }}>
                    Boomers use Fartbook, real Degens use TrenchSocial
                    </span>
                </div>
            )}
        </span>

        
        {!isLoggedIn && (
        <form onSubmit={handleSubmit}>
          {resetPasswordMode ? (
            <>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit">Set New Password</button>
            </>
          ) : (
            <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          {!forgotMode && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          )}

          {registerMode && (
            <>
              <input
                type="text"
                placeholder="Account Name"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Username (ex: trenchsocial)"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
              />
            </>
          )}

          {registerMode && awaitingCode && (
            <input
              type="text"
              placeholder="Verification Code"
              value={verificationCode}
              required
              onChange={(e) => setVerificationCode(e.target.value)}
            />
          )}

          <button type="submit">
            {forgotMode
              ? "Send reset link"
              : registerMode
              ? awaitingCode ? "Verify & Register" : "Send Code"
              : "Login"}
          </button>
              </>
          )}
        </form>
        )}

        {/* Join as guest */}
        {!forgotMode && (
          <button
            className="guest-button"
            onClick={onGuestJoin}
            style={{ marginTop: "0.5rem", backgroundColor: "#444"}}
          >
            Join as Guest
          </button>
        )}

        {/* Forgot password & register links */}
        {!forgotMode && !registerMode && (
          <>
          <p className="forgot-link" onClick={() => {
                setRegisterMode(true);
                setForgotMode(false);
                clearFields();
            }}>
            Don’t have an account? Register
            </p>

            <p className="forgot-link" onClick={() => {
                setForgotMode(true);
                setRegisterMode(false);
                clearFields();
            }}> 
            Forgot password?
            </p>
            
          </>
        )}

        {/* Back to login */}
        {(forgotMode || registerMode) && (
          <p className="forgot-link" onClick={() => {
            setAwaitingCode(false);
            setVerificationCode("");
            setForgotMode(false);
            setRegisterMode(false);
            setSubmitted(false);
            clearFields();
          }}>
            ← Back to Login
          </p>
        )}

      </div>
    </div>
  );
  
}
