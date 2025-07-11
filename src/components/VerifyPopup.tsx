import { Connection, PublicKey, Transaction, SystemProgram, clusterApiUrl } from "@solana/web3.js";

import { ToastContainer, toast } from "react-toastify";
import { BadgeCheck, CircleAlert, Info, TriangleAlert } from 'lucide-react';
import { Slide } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageURL: string;
  createdAt: string;
  followers: User[];
  following: User[];
  verified: boolean;
};

type Props = {
  onClose: () => void;
  currentUser: User;
};

export default function VerifyPopup({ onClose, currentUser }: Props) {
  const solanaAddress = "6ezxBgxZ2WGhLjE675XcMW1wobR7io7vED49yaieuunj";
  const network = import.meta.env.VITE_PUBLIC_SOLANA_RPC;

  async function handleConnectAndPay() {
    try {
        const provider = (window as any).solana;

        if (!provider?.isPhantom) {
        alert("Phantom Wallet not found. Please install it first.");
        return;
        }

        // Connect to Phantom wallet
        const resp = await provider.connect();
        const sender = resp.publicKey;

        const connection = new Connection(network);
        const recipient = new PublicKey(solanaAddress);

        const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: sender,
            toPubkey: recipient,
            lamports: 0.1 * 1e9, // 0.1 SOL
        })
        );

        transaction.feePayer = sender;
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;

        // Request signature from wallet
        const signed = await provider.signTransaction(transaction);
        const txid = await connection.sendRawTransaction(signed.serialize());

        toast.info("Transaction sent! Awaiting confirmation...");

        await connection.confirmTransaction(txid);
        toast.success("✅ Verified payment sent successfully!");

        // Call backend to mark user as verified
        const res = await fetch(`https://trenchsocial-backend.onrender.com/api/users/verify/${currentUser.username}`, {
        method: "PATCH",
        });

        if (!res.ok) {
        toast.error("❌ Payment succeeded, but verification failed. Verification will be made manually", {
            position: "top-right",
            autoClose: 3000,
        });
        return;
        }

        toast.success("🎉 You are now verified!", {
            position: "top-right",
            autoClose: 3000,
        });

        onClose();
    } catch (err: any) {
        let userMessage = "Something went wrong. Please try again.";

        if (err.message.includes("User rejected the request")) {
        userMessage = "Transaction cancelled by the user.";
        } else if (err.message.includes("insufficient funds for rent")) {
        userMessage = "You don't have enough SOL to complete this transaction.";
        } else if (err.message.includes("Access forbidden")) {
        userMessage = "Your RPC endpoint is not authorized (403).";
        }

        toast.error(userMessage, {
        position: "top-right",
        autoClose: 3000,
        });
    }
    }


  return (
    <>
    <ToastContainer
          aria-label="Notification Toasts"
          transition={Slide}
          icon={({ type }) => {
            // theme is not used in this example but you could
            switch (type) {
              case 'info':
                return <Info className="stroke-indigo-400" />;
              case 'error':
                return <CircleAlert className="stroke-red-500" />;
              case 'success':
                return <BadgeCheck className="stroke-green-500" />;
              case 'warning':
                return <TriangleAlert className="stroke-yellow-500" />;
              default:
                return null;
            }
          }}
        />

    <div className="popup-backdrop">
      <div className="popup-box" style={{ position: "relative" }}>
        <button
          onClick={onClose}
          aria-label="Close popup"
          style={{
            position: "absolute",
            top: "0.5rem",
            right: "1rem",
            background: "none",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
            color: "#666",
            padding: 0,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "auto",
            height: "auto",
          }}
        >
          ❌
        </button>

        <p style={{ fontSize: "1vw", marginBottom: "1rem" }}>
          Send <strong>0.1 SOL</strong> to:
        </p>

        <div
          style={{
            background: "#f3f3f3",
            padding: "1rem",
            borderRadius: "8px",
            fontSize: "0.9vw",
            wordBreak: "break-all",
            marginBottom: "0.5rem",
          }}
        >
          {solanaAddress}
        </div>

        <button
          onClick={handleConnectAndPay}
          style={{
            padding: "0.8rem 1.5rem",
            backgroundColor: "#512da8",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Connect Phantom & Pay 0.1 SOL
        </button>

        <p style={{ fontSize: "0.8vw", marginTop: "1rem", color: "#666" }}>
          Verification is processed instantly after payment.<br></br>Refresh the page after it.
        </p>
      </div>
    </div>
    </>
  );
}
