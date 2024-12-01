// src/components/Notification.js
import React, { useEffect } from 'react';

function Notification({ message, clearMessage }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        clearMessage();  // Automatically clear the message after 7 seconds
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);

  return (
    <>
      {message && <div className="notification">{message}</div>}
    </>
  );
}

export default Notification;
