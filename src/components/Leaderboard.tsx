import React, { useEffect, useState } from "react";
import "../styles/leaderboard.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PostView from "./PostView";

type LeaderboardProps = {
  handleOpenProfile: (username: string) => void;
  changetoProfileTab: (tab: string) => void;
};

export default function Leaderboard({ handleOpenProfile, changetoProfileTab }: LeaderboardProps) {
  const [mostFollowers, setMostFollowers] = useState([]);
  const [mostContributions, setMostContributions] = useState([]);
  const [mostLiked, setMostLiked] = useState([]);
  const [mostRetruhted, setMostRetruhted] = useState([]);
  const [mostPosts, setMostPosts] = useState([]); 
  const [showPost, setShowPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    async function fetchLeaderboards() {
      try {
        let res = await fetch("https://trenchsocial-backend.onrender.com/api/posts/most-liked");
        if (!res.ok) throw new Error("Failed to fetch most liked posts");
        let data = await res.json();
        setMostLiked(data);

        res = await fetch("https://trenchsocial-backend.onrender.com/api/posts/most-retruths");
        if (!res.ok) throw new Error("Failed to fetch most retruthed posts");
        data = await res.json();
        setMostRetruhted(data);

        res = await fetch("https://trenchsocial-backend.onrender.com/api/users/most-followers");
        if (!res.ok) throw new Error("Failed to fetch most followers");
        data = await res.json();
        setMostFollowers(data);

        res = await fetch("https://trenchsocial-backend.onrender.com/api/users/most-contributions");
        if (!res.ok) throw new Error("Failed to fetch most contributions");
        data = await res.json();
        setMostContributions(data);

        res = await fetch("https://trenchsocial-backend.onrender.com/api/users/most-posts");
        if (!res.ok) throw new Error("Failed to fetch most posts");
        data = await res.json();
        setMostPosts(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load leaderboards. Please try again later.");
      }
    }

    fetchLeaderboards();
  }, []);

  const ranks = ["gold", "silver", "bronze"];
  const emojis = ["🥇", "🥈", "🥉"];

  const renderLeaderboard = (posts, title, metricKey) => (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <span>{title}</span>
      </div>
      <p className="description">Top {metricKey} posts of all time</p>

      {posts.slice(0, 5).map((post, index) => {
        const metric = metricKey === "liked" ? post.likes : post.retruths;
        
        const rankClass = ranks[index] || ""; // gold/silver/bronze for top 3, "" for others
        const emoji = emojis[index] || `${index + 1}º`; // 🥇, 🥈, 🥉, then "4º", "5º"
        
        return (
          <div key={post.id} className={`leaderboard-item ${rankClass}`}>
            <div className="rank">{emoji}</div>
            <img
              className="avatar"
              src={post.imageURL || "../../public/defaultpfp.png"}
              alt={post.username}
            />
            <div className="user-info" style={{ backgroundColor: "transparent" }}>
              <a style={{ backgroundColor: "transparent", display:"inline-flex", alignItems:"center", textDecoration:"none", gap:"0.15em" }}>
                {post.name}
                {post.verified && (
                  <svg
                    width="1.2em"
                    height="1.2em"
                    style={{ backgroundColor: "transparent" }}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="blue"
                  >
                    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path>
                  </svg>
                )}
              </a>
              <div className="likes" style={{ backgroundColor: "transparent" }}>
                {metric.length} {metricKey === "liked" ? "likes" : "retruths"}
              </div>
            </div>
            <button
              className="view-link"
              style={{
                backgroundColor: "transparent",
                color: "blue",
                border: "none",
                cursor: "pointer"
              }}
              onClick={() => {
                setSelectedPost(post);
                setShowPost(true);
              }}
            >
              View Post
            </button>
          </div>
        );
      })}
    </div>
  );

  const renderUserLeaderboard = (users, title, metricKey) => (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <span>{title}</span>
      </div>
      <p className="description">
        Top users by {metricKey === "contributions"
          ? "contributions (posts + comments)"
          : metricKey === "posts"
          ? "number of posts"
          : "number of " + metricKey}
      </p>

      {users.slice(0, 5).map((user, index) => {
        const value =
          metricKey === "followers"
            ? user.followers?.length || 0
            : metricKey === "posts"
            ? user.postCount
            : user.postCount + user.commentCount;

        const rankClass = ranks[index] || ""; // gold/silver/bronze for top 3, "" for others
        const emoji = emojis[index] || `${index + 1}º`; // 🥇, 🥈, 🥉, then "4º", "5º"

        return (
          <div key={index} className={`leaderboard-item ${rankClass}`}>
            <div className="rank">{emoji}</div>
            <img
              className="avatar"
              src={user.imageURL || "../../public/defaultpfp.png"}
              alt={user.username}
            />
            <div className="user-info" style={{ backgroundColor: "transparent" }}>
              <a style={{ backgroundColor: "transparent", display:"inline-flex", alignItems:"center", gap:"0.15em" }}>
                {user.name}
                {user.verified && (
                  <svg
                    width="1.2em"
                    height="1.2em"
                    style={{ backgroundColor: "transparent" }}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="blue"
                  >
                    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path>
                  </svg>
                )}
              </a>
              <div className="likes" style={{ backgroundColor: "transparent" }}>
                {value} {metricKey}
              </div>
            </div>
            <button
              className="view-link"
              style={{
                backgroundColor: "transparent",
                color: "blue",
                border: "none",
                cursor: "pointer"
              }}
              onClick={() => {handleOpenProfile(user.username); changetoProfileTab("profile")}}
            >
              View Profile
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="leaderboard-side">
      <ToastContainer />
      <div className="main-div">
        <span className="title">Leaderboard</span>
      </div>

      {showPost && selectedPost && (
        <PostView
          post={selectedPost}
          onClose={() => {
            setShowPost(false);
            setSelectedPost(null);
          }}
        />
      )}

      <div className="leaderboard-list">
        {renderLeaderboard(mostLiked, "❤️ Most Liked Posts", "liked")}
        {renderLeaderboard(mostRetruhted, "🔁 Most Retruthed Posts", "retruthed")}
        {renderUserLeaderboard(mostFollowers, "👥 Most Followers", "followers")}
        {renderUserLeaderboard(mostContributions, "💬 Most Contributions", "contributions")}
        {renderUserLeaderboard(mostPosts, "📢 Most Active Users", "posts")}
      </div>
    </div>
  );
}
