import { useState } from "react";

type Props = {
  onSubmit: (type:string, message:string) => void;
  onClose: () => void;
};

export default function ReportPopup({ onSubmit, onClose }: Props) {
  const [type, setType] = useState<"Bug Report" | "Suggestion">("Bug Report");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="popup-backdrop">
      <div className="popup-box" style={{position: "relative"}}>
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "0",
            right: "0",
            background: "none",
            border: "none",
            fontSize: "1rem",
            cursor: "pointer",
            color: "#666",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "auto",
            height: "auto"
          }}
        >
          ❌
        </button>

        <span>Send Feedback</span>
        
        <form onSubmit={(e) => {
          e.preventDefault(); 
          onSubmit(type, message); 
          onClose();
          setSubmitted(true); 
        }}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "Bug Report" | "Suggestion")}
            style={{
              width: "85%",
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "1vw",
              color: "#333"
            }}
          >
            <option>Bug Report</option>
            <option>Suggestion</option>
          </select>

          <textarea
            placeholder="Describe the issue or suggestion..."
            value={message}
            required
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: "85%",
              height: "8rem",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              resize: "none",
              fontSize: "1vw",
              color: "black"
            }}
          />

          <button type="submit">Submit</button>
        </form>

        {submitted && (
          <p style={{ marginTop: "10px", color: "green" }}>
            Feedback sent. Thank you!
          </p>
        )}
      </div>
    </div>
  );
}