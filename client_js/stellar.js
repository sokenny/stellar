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
  let visitedPages = [];

  let isInternalNavigation = false;
  let pagesWithExperiments = [];

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

  function updateSessionStorage() {
    const sessionData = {
      timeOnPage,
      clickCount,
      scrollDepth,
      experimentsRun,
      visitedPages,
      pagesWithExperiments,
    };
    sessionStorage.setItem('stellarSessionData', JSON.stringify(sessionData));
  }

  function restoreSessionData() {
    const storedData = sessionStorage.getItem('stellarSessionData');
    if (storedData) {
      const {
        timeOnPage: storedTime,
        clickCount: storedClicks,
        scrollDepth: storedDepth,
        experimentsRun: storedExperiments,
        visitedPages: storedVisitedPages,
        pagesWithExperiments: storedPagesWithExperiments,
      } = JSON.parse(storedData);
      timeOnPage = storedTime;
      clickCount = storedClicks;
      scrollDepth = storedDepth;
      experimentsRun = storedExperiments;
      visitedPages = storedVisitedPages;
      pagesWithExperiments = storedPagesWithExperiments;
    }
  }

  function sendDataOnLeave() {
    window.addEventListener('beforeunload', () => {
      if (!isInternalNavigation) {
        const data = {
          sessionId,
          timeOnPage,
          clickCount,
          scrollDepth,
          idempotencyKey: sessionId,
          experimentsRun,
          visitedPages,
        };

        navigator.sendBeacon(
          `${STELLAR_API_URL}/experiments/end-session`,
          JSON.stringify(data),
        );
      }
    });

    // Detect internal navigation (links within the site)
    document.addEventListener('click', (e) => {
      if (
        e.target.tagName === 'A' &&
        e.target.hostname === window.location.hostname
      ) {
        isInternalNavigation = true;
        updateSessionStorage(); // Store session data before navigating away
      }
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

  function showLoadingState() {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'stellar-loading';
    loadingElement.textContent = 'LOADING...';
    loadingElement.style.position = 'fixed';
    loadingElement.style.top = '0';
    loadingElement.style.left = '0';
    loadingElement.style.height = '100%';
    loadingElement.style.width = '100%';
    loadingElement.style.backgroundColor = 'black';
    loadingElement.style.zIndex = '9999';
    loadingElement.style.display = 'flex';
    loadingElement.style.justifyContent = 'center';
    loadingElement.style.alignItems = 'center';
    loadingElement.style.fontSize = '1.2rem';
    loadingElement.style.color = '#fff';
    document.body.appendChild(loadingElement);
  }

  function hideLoadingState() {
    const loadingElement = document.getElementById('stellar-loading');
    if (loadingElement) {
      loadingElement.remove();
    }
  }

  async function fetchExperiments() {
    const pageUrl = window.location.href;

    if (!pagesWithExperiments.includes(pageUrl) && visitedPages.length > 1) {
      console.log('we do not have experiments for this page');
      return;
    }

    showLoadingState();

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

      pagesWithExperiments = data.map((experiment) => experiment.url);

      mountExperiments(data);
    } catch (error) {
      console.error('Error fetching experiments:', error);
    } finally {
      hideLoadingState();
    }
  }

  function trackPageVisit() {
    const currentPage = window.location.pathname;
    visitedPages.push(currentPage);
    updateSessionStorage();
  }

  // Wrap history methods to detect SPA navigation
  function wrapHistoryMethods() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function () {
      originalPushState.apply(this, arguments);
      trackPageVisit();
    };

    history.replaceState = function () {
      originalReplaceState.apply(this, arguments);
      trackPageVisit();
    };

    window.addEventListener('popstate', function () {
      trackPageVisit();
    });
  }

  function initializeScript() {
    restoreSessionData();
    trackPageVisit();
    wrapHistoryMethods();
    startTimeTracking();
    trackClicks();
    trackScrollDepth();
    sendDataOnLeave();
    fetchExperiments();
  }

  initializeScript();
})();
