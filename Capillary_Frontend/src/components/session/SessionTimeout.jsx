import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SessionTimeout = () => {
  const [isInactive, setIsInactive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timeout;
    let activityTimer;

    const resetTimer = () => {
      clearTimeout(timeout);
      clearTimeout(activityTimer);


      timeout = setTimeout(() => {
        setIsInactive(true);
        localStorage.clear(); 
        navigate("/");
      }, 15 * 60 * 1000); 

 
      activityTimer = setTimeout(() => {
        setIsInactive(false);
      }, 1000); 
    };

    const events = ["mousemove", "mousedown", "keypress", "scroll", "touchstart"];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    resetTimer();
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      clearTimeout(timeout);
      clearTimeout(activityTimer);
    };
  }, [navigate]);

  return (
    <div>
      {isInactive ? (
        <div>Your session has timed out due to inactivity. Please log in again.</div>
      ) : (
        <div>Session is active</div>
      )}
    </div>
  );
};

export default SessionTimeout;
