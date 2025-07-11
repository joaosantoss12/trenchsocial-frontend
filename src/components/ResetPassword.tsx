import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");

  const handleReset = async () => {
    const rsp = await fetch("http://localhost:4000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: newPassword }),
    });

    const data = await rsp.json();
    if (data.success) {
      alert("Password reset!");
      navigate("/login");
    } else {
      alert(data.error);
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handleReset}>Submit</button>
    </div>
  );
}
