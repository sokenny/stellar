(function () {
  'use strict';

  const STELLAR_API_URL = 'http://localhost:3001/api';

  function getApiKey() {
    const scriptTag = document.querySelector('script[data-stellar-api-key]');
    return scriptTag ? scriptTag.getAttribute('data-stellar-api-key') : null;
  }

  function getStellarData() {
    const stellarData = localStorage.getItem('stellarData');
    return stellarData ? JSON.parse(stellarData) : {};
  }

  function setStellarData(data) {
    localStorage.setItem('stellarData', JSON.stringify(data));
  }

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
  let hasFetchedExperiments = false;

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
      hasFetchedExperiments,
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
        hasFetchedExperiments: storedHasFetchedExperiments,
      } = JSON.parse(storedData);
      timeOnPage = storedTime;
      clickCount = storedClicks;
      scrollDepth = storedDepth;
      experimentsRun = storedExperiments;
      visitedPages = storedVisitedPages;
      pagesWithExperiments = storedPagesWithExperiments;
      hasFetchedExperiments = storedHasFetchedExperiments;
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

    document.addEventListener('click', (e) => {
      if (
        e.target.tagName === 'A' &&
        e.target.hostname === window.location.hostname
      ) {
        isInternalNavigation = true;
        updateSessionStorage();
      }
    });
  }

  function mountExperiments(experiments) {
    console.log('mounting experiments: ', experiments);
    const stellarData = getStellarData();

    experiments.forEach((experiment) => {
      console.log('mounting experiment: ', experiment);
      const storedVariantId = stellarData[experiment.id];

      const element = experiment.journey.elements.find(
        (element) => element.id === experiment.element_id,
      );

      let variantToUse = storedVariantId || experiment.variant_to_use;

      experiment.variants.forEach((variant) => {
        if (variant.id === variantToUse) {
          console.log(
            'element selector: ',
            element.selector,
            document.querySelector(element.selector),
          );
          document.querySelector(element.selector).innerHTML = variant.text;

          if (!storedVariantId) {
            // Store the variant in stellarData
            stellarData[experiment.id] = variant.id;
            setStellarData(stellarData);
          }

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

  // TODO-maybe: Perhaps avoid fetching experiments if we already have fetched them and available in localStorage. But this should have a TTL or something.
  async function fetchExperiments() {
    const pageUrl = window.location.href;
    if (
      !pagesWithExperiments.includes(pageUrl) &&
      visitedPages.length > 1 &&
      hasFetchedExperiments
    ) {
      console.log('we do not have experiments for this page');
      return;
    }

    showLoadingState();

    const apiKey = getApiKey();

    try {
      const response = await fetch(
        `${STELLAR_API_URL}/experiments/client?page=${encodeURIComponent(
          pageUrl,
        )}`,
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

      // TODO: This filtering should be done on the server. fetchexperiments could send the domain, and we can then retrieve experiments for projects with this domain
      const experimentsToMount = data.filter((experiment) =>
        window.location.href.includes(experiment.url),
      );

      mountExperiments(experimentsToMount);
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
