(function () {
  'use strict';

  const STELLAR_API_URL = 'http://localhost:3001/api';

  const urlParams = new URLSearchParams(window.location.search);
  const stellarMode = urlParams.get('stellarMode');

  if (!localStorage.getItem('stellarVisitorId')) {
    localStorage.setItem(
      'stellarVisitorId',
      'visitor_' + Date.now() + Math.random(),
    );
  }
  const stellarVisitorId = localStorage.getItem('stellarVisitorId');

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

    console.log('experimentsRunou: ', experimentsRun);
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
          stellarVisitorId,
        };

        navigator.sendBeacon(
          `${STELLAR_API_URL}/experiments/end-session`,
          JSON.stringify(data),
        );
      }
    });

    document.addEventListener('click', (e) => {
      const target = e.target as any;
      if (
        target.tagName === 'A' &&
        target.hostname === window.location.hostname
      ) {
        isInternalNavigation = true;
        updateSessionStorage();
      }
    });
  }

  function mountExperiments(experiments) {
    console.log('mounting experiments: ', experiments);
    const stellarData = getStellarData();
    const currentPageUrl = window.location.href;

    experiments.forEach((experiment) => {
      console.log('mounting experiment: ', experiment);
      const storedVariantId = stellarData[experiment.id];

      const element = experiment.page.elements.find(
        (el) => el.id === experiment.element_id,
      );

      let variantToUse = storedVariantId || experiment.variant_to_use;

      experiment.variants.forEach((variant) => {
        if (variant.id === variantToUse) {
          const selectorElement = document.querySelector(element.selector);
          console.log('element selector: ', element.selector, selectorElement);
          if (selectorElement) {
            selectorElement.innerHTML = variant.text;
          }

          if (!storedVariantId) {
            stellarData[experiment.id] = variant.id;
            setStellarData(stellarData);
          }

          const isExperimentInArray = experimentsRun.find(
            (e) => e.experiment === experiment.id,
          );

          if (!isExperimentInArray) {
            experimentsRun.push({
              experiment: experiment.id,
              variant: variant.id,
              converted: false,
              goalType: experiment.goal.type,
              goalElementUrl: experiment.goal.element_url,
              goalUrlMatchType: experiment.goal.url_match_type,
              goalUrlMatchValue: experiment.goal.url_match_value,
            });
          }

          if (
            experiment.goal.type === 'CLICK' &&
            currentPageUrl.includes(experiment.goal.element_url)
          ) {
            if (selectorElement) {
              selectorElement.addEventListener('click', function () {
                const expRun = experimentsRun.find(
                  (e) =>
                    e.experiment === experiment.id && e.variant === variant.id,
                );
                if (expRun) {
                  console.log('converted click!');
                  expRun.converted = true;
                }
              });
            }
          }
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

  // function checkPageVisitGoals(experiments) {
  //   console.log('running checkPageVisitGoals');
  //   const currentPage = window.location.href;

  //   experiments.forEach((experiment) => {
  //     if (
  //       experiment.goal.type === 'PAGE_VISIT' &&
  //       currentPage.includes(experiment.goal.page_url)
  //     ) {
  //       // Find the experimentRun entry and mark as converted
  //       const experimentRun = experimentsRun.find(
  //         (e) => e.experiment === experiment.id,
  //       );
  //       if (experimentRun) {
  //         experimentRun.converted = true;
  //       }
  //     }
  //   });
  // }

  // TODO-maybe: Perhaps avoid fetching experiments if we already have fetched them and available in localStorage. But this should have a TTL or something.
  async function fetchExperiments() {
    console.log('fetching! ');
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
      console.log('datusarda: ', data);

      pagesWithExperiments = data.map((experiment) => experiment.url);

      // TODO: This filtering should be done on the server. fetchexperiments could send the domain, and we can then retrieve experiments for projects with this domain
      const experimentsToMount = data.filter((experiment) =>
        window.location.href.includes(experiment.url),
      );

      console.log('experiments to mount: ', experimentsToMount);

      // bind to trackPageVisit and call checkPageVisitGoals

      mountExperiments(experimentsToMount);
    } catch (error) {
      console.error('Error fetching experiments:', error);
    } finally {
      hideLoadingState();
    }
  }

  function hasPageVisitGoalConverted(experiment) {
    const currentPage = window.location.href;
    if (experiment.goalType === 'PAGE_VISIT') {
      console.log('primer if dentro');
      if (
        experiment.goalUrlMatchType === 'CONTAINS' &&
        currentPage.includes(experiment.goalUrlMatchValue)
      ) {
        return true;
      }
      if (
        experiment.goalUrlMatchType === 'EXACT' &&
        currentPage === experiment.goalUrlMatchValue
      ) {
        return true;
      }
    }
    return false;
  }

  function trackPageVisit() {
    console.log('track page visit run! ', experimentsRun);
    const currentPage = window.location.pathname;
    visitedPages.push(currentPage);
    updateSessionStorage();

    console.log('currentPage: ', currentPage);

    experimentsRun.forEach((experiment) => {
      if (hasPageVisitGoalConverted(experiment)) {
        console.log('converted page visit!');
        experiment.converted = true;
      }
    });
  }

  // Wrap history methods to detect SPA navigation
  function wrapHistoryMethods() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    // TODO-p2: some websites trigger a replace state on page load which wrongly triggers a trackPageVisit. We should avoid this with a debounce mechanism or something.
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
    if (stellarMode === 'true') {
      return;
    }
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
