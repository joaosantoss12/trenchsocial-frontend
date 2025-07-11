import React, { useEffect, useState } from 'react';
import BugsReport from './BugsReport'

import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BadgeCheck, CircleAlert, Info, TriangleAlert } from 'lucide-react';


import '../styles/left.css';


type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageURL: string;

};

type LeftSideProps = {
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  setViewedProfileNull: () => void;
  saveReport: (type: string, message:string) => void;
  isGuest: boolean;

  selectedTab:string;

  handleOpenProfile: (username: string) => void;

};

const Icons = {
  home: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 5C3 3.89772 3.89772 3 5 3H19.01C20.1123 3 21.01 3.89772 21.01 5V9.01C21.01 10.1123 20.1123 11.01 19.01 11.01H5C3.89772 11.01 3 10.1123 3 9.01V5ZM5 5V9.01H19.01V5H5ZM3 15C3 14.4477 3.44772 14 4 14H20C20.5523 14 21 14.4477 21 15C21 15.5523 20.5523 16 20 16H4C3.44772 16 3 15.5523 3 15ZM3 20C3 19.4477 3.44772 19 4 19H20C20.5523 19 21 19.4477 21 20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20Z" />
    </svg>
  ),
  messages: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2"></rect>
      
    </svg>
  ),
  live: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 20.25H18M10.5 17.25V20.25M13.5 17.25V20.25M3.375 17.25H20.625C21.246 17.25 21.75 16.746 21.75 16.125V4.875C21.75 4.254 21.246 3.75 20.625 3.75H3.375C2.754 3.75 2.25 4.254 2.25 4.875V16.125C2.25 16.746 2.754 17.25 3.375 17.25Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  groups: (
    <svg width="24" height="24" fill="currentcolor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
      <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM609.3 512l-137.8 0c5.4-9.4 8.6-20.3 8.6-32l0-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2l61.4 0C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"/>
    </svg>
  ),
  leaderboard: (
    <svg width="24" height="24" viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M256 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm-95.2-8c-18.1 0-31.3 12.8-35.6 26.9c-8 26.2-32.4 45.2-61.2 45.2c-10 0-19.4-2.3-27.7-6.3c-7.6-3.7-16.7-3.3-24 1.2C.7 162.1-3.1 177.1 3.7 188.9L97.6 352l55.4 0-83-144.1c40.5-2.2 75.3-25.9 93.1-59.8c22 26.8 55.4 43.9 92.8 43.9s70.8-17.1 92.8-43.9c17.8 34 52.6 57.7 93.1 59.8L359 352l55.4 0 93.9-163.1c6.8-11.7 3-26.7-8.6-33.8c-7.3-4.5-16.4-4.9-24-1.2c-8.4 4-17.7 6.3-27.7 6.3c-28.8 0-53.2-19-61.2-45.2C382.5 100.8 369.3 88 351.2 88c-14.5 0-26.3 8.5-32.4 19.3c-12.4 22-35.9 36.7-62.8 36.7s-50.4-14.8-62.8-36.7C187.1 96.5 175.4 88 160.8 88zM133.2 432l245.6 0 16.6 32-278.7 0 16.6-32zm283.7-30.7c-5.5-10.6-16.5-17.3-28.4-17.3l-265 0c-12 0-22.9 6.7-28.4 17.3L68.6 452.5c-3 5.8-4.6 12.2-4.6 18.7c0 22.5 18.2 40.8 40.8 40.8l302.5 0c22.5 0 40.8-18.2 40.8-40.8c0-6.5-1.6-12.9-4.6-18.7l-26.5-51.2z"/>
    </svg>
  ),
  profile: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24" data-testid="svg-icon"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zm-4 7a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"></path></svg>
  ),
  logout: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M9 12h12m0 0l-3-3m3 3l-3 3"/>
    </svg>
  ),
  login: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 12h9m-3-3l3 3m-3 3l3-3"/>
    </svg>
  ),
  bugs: (
    <svg width="24" height="24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 0c53 0 96 43 96 96l0 3.6c0 15.7-12.7 28.4-28.4 28.4l-135.1 0c-15.7 0-28.4-12.7-28.4-28.4l0-3.6c0-53 43-96 96-96zM41.4 105.4c12.5-12.5 32.8-12.5 45.3 0l64 64c.7 .7 1.3 1.4 1.9 2.1c14.2-7.3 30.4-11.4 47.5-11.4l112 0c17.1 0 33.2 4.1 47.5 11.4c.6-.7 1.2-1.4 1.9-2.1l64-64c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-64 64c-.7 .7-1.4 1.3-2.1 1.9c6.2 12 10.1 25.3 11.1 39.5l64.3 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c0 24.6-5.5 47.8-15.4 68.6c2.2 1.3 4.2 2.9 6 4.8l64 64c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-63.1-63.1c-24.5 21.8-55.8 36.2-90.3 39.6L272 240c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 239.2c-34.5-3.4-65.8-17.8-90.3-39.6L86.6 502.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l64-64c1.9-1.9 3.9-3.4 6-4.8C101.5 367.8 96 344.6 96 320l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64.3 0c1.1-14.1 5-27.5 11.1-39.5c-.7-.6-1.4-1.2-2.1-1.9l-64-64c-12.5-12.5-12.5-32.8 0-45.3z"/></svg>          
  ),
};

const TABS = [
  { id: 'home', label: 'Home', icon: Icons.home, disabledForGuest: false },
  { id: 'messages', label: 'Messages', icon: Icons.messages, disabledForGuest: true },
  { id: 'live', label: 'Watch Live Trenchers', icon: Icons.live, disabledForGuest: false },
  { id: 'groups', label: 'Groups', icon: Icons.groups, disabledForGuest: true },
  { id: 'leaderboard', label: 'Leaderboard', icon: Icons.leaderboard, disabledForGuest: false },
  { id: 'profile', label: 'Profile', icon: Icons.profile, disabledForGuest: true },
  { id: 'bugs', label: 'Report Bugs', icon: Icons.bugs, disabledForGuest: true },
];

export default function LeftSide({ onTabChange, onLogout, saveReport, isGuest, selectedTab, setViewedProfileNull, handleOpenProfile }: LeftSideProps) {
  const [showBugReport, setShowBugReport] = useState(false);

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("https://trenchsocial-backend.onrender.com/api/users");

        if (!res.ok) {
          toast.error("Failed to load users for search engine! Please refresh the page", {
              position: "top-center",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: false,
              theme: "light",
            }
          );
          return;
        }

        const data = await res.json();
        setUsers(data);
      } catch (error) {
        toast.error("Failed to load users for search engine! Please refresh the page", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: "light",
          }
        );

        return;
      }
    };

    fetchUsers();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const matches = users.filter((user) =>
      user.username.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query)
    );

    setSearchResults(matches);
  };


  const handleTabChange = (tab: string) => {
    onTabChange(tab);
  };
  const handleSubmitBugReport = (type:string, message:string) => {
    setShowBugReport(false);
    saveReport(type,message);
  };
  const handleCloseBugReport = () => {
    setShowBugReport(false);
  };  

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
    

    <div className="left-side">
      <div className="logo-container" onClick={() => {setViewedProfileNull(); handleTabChange('home')}} style={{ cursor: "pointer" }}>
        <img src="/trench-social2.png" />
      </div>

      <div className="search-container">
        <div className="search-wrapper">
          <input
            id="search"
            onChange={handleSearchChange}
            placeholder="Search for users"
            name="search"
            aria-expanded="true"
            aria-haspopup="listbox"
            role="combobox"
            type="text"
            className="search-input"
            value={searchQuery}
            aria-controls="floating-ui-pe4l4"
          />
        </div>
        <button type="button" aria-label="Search" className="search-icon-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 512 512" fill="#555"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
        </button>

        {searchQuery && (
        <div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map(user => (
              <div key={user.id} className="search-result-item" onClick={() => {handleOpenProfile(user.username); onTabChange("profile")}}>
                <img src={user.imageURL} alt={user.name} className="result-avatar" />
                <div className="result-info">
                  <div className="result-name">{user.name}</div>
                  <div className="result-username">@{user.username}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">No user match</div>
          )}
        </div>
      )}
      </div>


      <div className="menu-container">

        <a
          className={`home ${selectedTab === 'home' ? 'selected' : ''}`}
          onClick={() => {setViewedProfileNull(); handleTabChange('home')}}
        >
          {TABS[0].icon}
          <span>{TABS[0].label}</span>
        </a>

        <a
          className={`messages ${isGuest ? "soon" : ""} ${selectedTab == 'messages' ? 'selected' : ''}`}
          onClick={!isGuest ? () => {setViewedProfileNull(); handleTabChange('messages')} : () => {}}
        >
          <span style={{ position: "relative", display: "inline-block" }}>
            {TABS[1].icon}
            <div style={{ position: "absolute", top: "-0.25rem", right: "-0.5rem", width: "0.5rem", height: "0.5rem", borderRadius: "9999px", backgroundColor: "#ef4444", boxShadow: "0 0 0 2px white" }} />
          </span>
          <span>{TABS[1].label}</span>
        </a>

        <a
          className={`live ${selectedTab == 'live' ? 'selected' : ''}`}
          onClick={() => {setViewedProfileNull(); handleTabChange('live')}}
        >
          {TABS[2].icon}
          <span>{TABS[2].label}</span>
        </a>

        <a
          className={`groups soon ${selectedTab == 'groups' ? 'selected' : ''}`}
          //onClick={!isGuest ? () => handleTabChange('groups') : () => {}}
          style={{ cursor: "normal" }}
        >
          {TABS[3].icon}
          <span>{TABS[3].label}</span>

          <span
            style={{ backgroundColor: "#cd0000", color: "white", fontSize: "0.7rem", fontWeight: "bold", padding: "0.2rem 0.4rem", borderRadius: "8px", textTransform: "uppercase", userSelect: "none" }}
          >
            soon
          </span>
        </a>

        <a
          className={`leaderboard ${selectedTab == 'leaderboard' ? 'selected' : ''}`}
          onClick={() => {setViewedProfileNull(); handleTabChange('leaderboard')}}
        >
          {TABS[4].icon}
          <span>{TABS[4].label}</span>
        </a>

        <a
          className={`profile ${isGuest ? "soon" : ""} ${selectedTab == 'profile' ? 'selected' : ''}`}
          onClick={!isGuest ? () => {setViewedProfileNull(); handleTabChange('profile')} : ()=>{}}
        >
          {TABS[5].icon}
          <span>{TABS[5].label}</span>
        </a>

        <a
          className={`bugs ${selectedTab === 'bugs' ? 'selected' : ''}`}
          onClick={() => setShowBugReport(true)}
        >
          {TABS[6].icon}
          <span>{TABS[6].label}</span>
        </a>

      {showBugReport &&(
        <BugsReport onSubmit={handleSubmitBugReport} onClose={handleCloseBugReport} isGuest={isGuest} />
      )}



        <div className="stats">

            {!isGuest && (
                <button onClick={() => onLogout()}>
                    <svg fill="white" style={{backgroundColor:"transparent"}} width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/></svg>
                    Logout
                </button>
            )}
            {isGuest && (
                <button onClick={() => onLogout()}>
                    <svg fill="white" style={{backgroundColor:"transparent"}} width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L32 320c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/></svg>
                    Login
                </button>
            )}

        </div>  

      </div>
    </div>
    </>
  );
}
