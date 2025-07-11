import React from "react";

type User = {
  id: string;
  name: string;
  username: string;
  email?: string;
  imageURL?: string;
  createdAt?: string | Date;
  followers?: User[];
  following?: User[];
  verified?: boolean;
};

type Comment = {
  id: string;
  name: string;
  username: string;
  text: string;
  imageURL?: string;
  createdAt: string | Date;
  likes?: User[];
};

type Post = {
  id: string;
  name: string;
  username: string;
  imageURL?: string;
  text: string;
  likes: User[];
  retruths: User[];
  comments: Comment[];
  createdAt: string | Date;
  images?: string[];
};

type Props = {
  post: Post;
  onClose?: () => void;
};

export default function PostView({ post, onClose }: Props) {
  if (!post) return null;

  const content = (
    <div className="popup-backdrop">
        <div className="popup-box" style={{position:"relative"}}>

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


        <div className="post-header" style={{width: "25%"}}>
            
            <img
            src={post.imageURL || "../../public/defaultpfp.png"}
            alt={`${post.name}'s avatar`}
            className="avatar"
            />
            <div className="user-info">
            <span className="name" style={{fontSize:"1rem"}}>{post.name}</span>
            <br></br>
            <span className="username" style={{fontSize:"1rem"}}>@{post.username}</span>
            </div>
        </div>
        <div className="post-content">
            {post.text && <p style={{color:"black", fontSize:"1.3rem", textAlign:"left" }}>{post.text}</p>}
            {post.images && post.images.length > 0 && (
            <div className={`image-layout ${getImageLayoutClass(post.images.length)}`}>
                {post.images.map((img, index) => (
                <img style={{width:"100%"}} key={index} src={img} alt={`Post image ${index + 1}`} />
                ))}
            </div>
            )}
        </div>
        <div className="post-footer" style={{marginTop:"0.5rem"}}>
            <span style={{fontSize: "0.9rem", color: "#666"}}>{new Date(post.createdAt).toLocaleString()}</span>
            <br></br>
            <div style={{ width:"100%", display: "flex", justifyContent: "space-evenly", marginTop:"0.5rem" }}>
                <span style={{fontSize: "0.9rem", color: "#666"}}>{post.likes.length} Likes</span>
                <span style={{fontSize: "0.9rem", color: "#666"}}>{post.retruths.length} Retruhts</span>
                <span style={{fontSize: "0.9rem", color: "#666"}}>{post.comments.length} Comments</span>
            </div>
        </div>
      </div>
    </div>
  );

  return content;
}

function getImageLayoutClass(count: number) {
  if (count === 1) return "one";
  if (count === 2) return "two";
  return "three";
}