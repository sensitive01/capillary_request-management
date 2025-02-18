import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const SessionTimeout = () => {
  const [isInactive, setIsInactive] = useState(false);
  const navigate = useNavigate();
  const TIMEOUT_DURATION = 15 * 60 * 1000;
  const WARNING_TIME = 1 * 60 * 1000;

  // Check if user is authenticated and session is valid
  const checkAuthentication = () => {
    const userData = localStorage.getItem("capEmpId");
    const lastActivityTime = localStorage.getItem("lastActivityTime");
    const hasRefreshed = sessionStorage.getItem("hasRefreshed");

    // Handle one-time refresh
    if (userData && !hasRefreshed) {
      sessionStorage.setItem("hasRefreshed", "true");
      window.location.reload();
      return;
    }

    // If no user data, just redirect without showing expired message
    if (!userData) {
      navigate("/");
      return;
    }

    // For existing users, check if session has expired
    if (lastActivityTime) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivityTime);
      if (timeSinceLastActivity > TIMEOUT_DURATION) {
        handleLogout(true); // Pass true to show expiration message
      }
    } else {
      // If user is logged in but no activity time, initialize it
      updateLastActivity();
    }
  };

  const handleLogout = (showExpirationMessage = false) => {
    localStorage.clear();
    sessionStorage.clear(); // Clear session storage as well

    if (showExpirationMessage) {
      Swal.fire({
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        navigate("/");
      });
    } else {
      navigate("/");
    }
  };

  // Rest of the component remains the same...
  const showWarning = () => {
    let timerInterval;
    let timeLeft = 60;

    Swal.fire({
      title: "Session Expiring Soon",
      html: `Your session will expire in <b>${timeLeft}</b> seconds.<br/>Would you like to stay logged in?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, keep me logged in",
      cancelButtonText: "Logout now",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      timer: 60000,
      timerProgressBar: true,
      didOpen: () => {
        timerInterval = setInterval(() => {
          timeLeft -= 1;
          const content = Swal.getHtmlContainer();
          if (content) {
            const b = content.querySelector("b");
            if (b) {
              b.textContent = timeLeft;
            }
          }
        }, 1000);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    }).then((result) => {
      if (result.isConfirmed) {
        resetTimer();
        updateLastActivity();
      } else if (
        result.dismiss === Swal.DismissReason.timer ||
        result.dismiss === Swal.DismissReason.cancel
      ) {
        handleLogout(true);
      }
    });
  };

  const updateLastActivity = () => {
    localStorage.setItem("lastActivityTime", Date.now().toString());
  };

  useEffect(() => {
    let timeout;
    let warningTimeout;
    let activityTimer;

    const resetTimer = () => {
      clearTimeout(timeout);
      clearTimeout(warningTimeout);
      clearTimeout(activityTimer);

      warningTimeout = setTimeout(() => {
        showWarning();
      }, TIMEOUT_DURATION - WARNING_TIME);

      timeout = setTimeout(() => {
        setIsInactive(true);
        handleLogout(true);
      }, TIMEOUT_DURATION);

      activityTimer = setTimeout(() => {
        setIsInactive(false);
      }, 1000);
    };

    const handleUserActivity = () => {
      if (localStorage.getItem("capEmpId")) {
        resetTimer();
        updateLastActivity();
      }
    };

    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    checkAuthentication();

    if (localStorage.getItem("capEmpId")) {
      events.forEach((event) => {
        window.addEventListener(event, handleUserActivity);
      });

      resetTimer();
      updateLastActivity();
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && localStorage.getItem("capEmpId")) {
        checkAuthentication();
        resetTimer();
        updateLastActivity();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(timeout);
      clearTimeout(warningTimeout);
      clearTimeout(activityTimer);
    };
  }, [navigate]);

  return null;
};

export default SessionTimeout;
