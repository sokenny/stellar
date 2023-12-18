// TODO: loading state before applying changes
// TODO: persist session / dont unload when user navigates to another page inside the same domain

(function () {
  'use strict';

  const STELLAR_API_URL = 'http://localhost:3001/api';

  function getSessionId() {
    let sessionId = localStorage.getItem('stellar_session_id');
    if (!sessionId) {
      const userAgent = window.navigator.userAgent.replace(/\D/g, '');
      sessionId = `session_${Date.now()}_${userAgent}`;
      localStorage.setItem('stellar_session_id', sessionId);
    }
    return sessionId;
  }

  const sessionId = getSessionId();

  let timeOnPage = 0;
  let clickCount = 0;
  let scrollDepth = 0;
  let experimentsRun = [];

  function startTimeTracking() {
    setInterval(() => {
      timeOnPage += 1;
    }, 1000);
  }

  function trackClicks() {
    document.addEventListener('click', () => {
      clickCount++;
    });
  }

  function trackScrollDepth() {
    document.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const viewportHeight = window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;

      const currentDepth = Math.floor(
        ((scrolled + viewportHeight) / totalHeight) * 100,
      );
      scrollDepth = Math.max(scrollDepth, currentDepth);
    });
  }

  function sendDataOnLeave() {
    window.addEventListener('beforeunload', () => {
      const data = {
        sessionId,
        timeOnPage,
        clickCount,
        scrollDepth,
        idempotencyKey: sessionId,
        experimentsRun,
      };

      navigator.sendBeacon(
        `${STELLAR_API_URL}/experiments/end-session`,
        JSON.stringify(data),
      );
    });
  }

  function mountExperiments(experiments) {
    experiments.forEach((experiment) => {
      const element = experiment.journey.elements.find((element) => {
        return element.id === experiment.element_id;
      });
      experiment.variants.forEach((variant) => {
        if (variant.id === experiment.variant_to_use) {
          document.querySelector(element.selector).innerHTML = variant.text;
          experimentsRun.push({
            experiment: experiment.id,
            variant: variant.id,
          });
        }
      });
    });
  }

  async function fetchExperiments() {
    const pageUrl = window.location.href;
    const apiKey = 'your_api_public_key';

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

      mountExperiments(data);
    } catch (error) {
      console.error('Error fetching experiments:', error);
    }
  }

  function initializeScript() {
    startTimeTracking();
    trackClicks();
    trackScrollDepth();
    sendDataOnLeave();
    fetchExperiments();
  }

  initializeScript();
})();
