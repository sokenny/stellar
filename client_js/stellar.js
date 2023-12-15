(function () {
  'use strict';

  const STELLAR_API_URL = 'http://localhost:3001/api';

  // Generate or retrieve a unique session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem('stellar_session_id');
    if (!sessionId) {
      const userAgent = window.navigator.userAgent.replace(/\D/g, ''); // Strip non-numeric characters
      sessionId = `session_${Date.now()}_${userAgent}`;
      localStorage.setItem('stellar_session_id', sessionId);
    }
    return sessionId;
  };

  const sessionId = getSessionId();

  // Variables to keep track of time and clicks
  let timeOnPage = 0;
  let clickCount = 0;

  // Function to handle the time tracking
  const startTimeTracking = () => {
    setInterval(() => {
      timeOnPage += 1; // Increment every second
    }, 1000);
  };

  // Function to handle click events
  const trackClicks = () => {
    document.addEventListener('click', () => {
      clickCount++;
    });
  };

  // Function to send data to server when user leaves page
  const sendDataOnLeave = () => {
    window.addEventListener('beforeunload', () => {
      const data = {
        sessionId,
        timeOnPage,
        clickCount,
      };

      navigator.sendBeacon(
        `${STELLAR_API_URL}/experiments/end-session`,
        JSON.stringify(data),
      );
    });
  };

  // Function to make a GET request to the server
  const fetchExperiments = async () => {
    const pageUrl = window.location.href;
    const apiKey = 'your_api_public_key'; // Replace with your actual public API key

    try {
      const response = await fetch(
        `${STELLAR_API_URL}/experiments?page=${encodeURIComponent(pageUrl)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error fetching experiments:', error);
    }
  };

  // Initialize the script
  startTimeTracking();
  trackClicks();
  sendDataOnLeave();
  fetchExperiments();
})();
