(function () {
  'use strict';

  console.log('LCDTM');

  const STELLAR_API_URL = 'process.env.STELLAR_API_URL/public';

  const urlParams = new URLSearchParams(window.location.search);
  const stellarMode = urlParams.get('stellarMode');
  const sessionIssues = [];
  let global__experimentsToMount = null;
  let global__observer = null;
  let global__mountedOnThisPageLoad = {};

  if (!localStorage.getItem('stellarVisitorId')) {
    localStorage.setItem(
      'stellarVisitorId',
      'visitor_' + Date.now() + Math.random(),
    );
  }
  const stellarVisitorId = localStorage.getItem('stellarVisitorId');

  function getPathFromURL(url) {
    const a = document.createElement('a');
    a.href = url;

    const pathname = a.pathname.endsWith('/') ? a.pathname : a.pathname + '/';
    return pathname.toLowerCase();
  }

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

  function setStellarCache(data) {
    try {
      const cacheData = {
        experiments: data,
        timestamp: Date.now(),
      };
      localStorage.setItem('stellar__cache', JSON.stringify(cacheData));
    } catch (e) {
      console.error('Error setting stellar cache: ', e);
    }
  }

  function getStellarCache() {
    try {
      const cachedData = localStorage.getItem('stellar__cache');
      if (!cachedData) {
        return null;
      }

      const { experiments, timestamp } = JSON.parse(cachedData);
      const now = Date.now();
      // const TTL = 300000; // 5 minutes in milliseconds
      const TTL = 5000; // 5 seconds in milliseconds

      if (now - timestamp < TTL) {
        return experiments;
      } else {
        return null;
      }
    } catch (e) {
      console.error('Error getting stellar cache: ', e);
      return null;
    }
  }

  function getVisitorId() {
    let visitorId = localStorage.getItem('stellar_visitor_id');
    if (!visitorId) {
      const userAgent = window.navigator.userAgent.replace(/\D/g, '');
      visitorId = `session_${Date.now()}_${userAgent}`;
      localStorage.setItem('stellar_visitor_id', visitorId);
    }
    return visitorId;
  }

  const visitorId = getVisitorId();

  let timeOnPage = 0;
  let clickCount = 0;
  let scrollDepth = 0;
  let activeExperiments = [];
  console.log('cocaina - a');
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
      activeExperiments,
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
        activeExperiments: storedExperiments,
        visitedPages: storedVisitedPages,
        pagesWithExperiments: storedPagesWithExperiments,
        hasFetchedExperiments: storedHasFetchedExperiments,
      } = JSON.parse(storedData);
      timeOnPage = storedTime;
      clickCount = storedClicks;
      scrollDepth = storedDepth;
      activeExperiments = storedExperiments;
      visitedPages = storedVisitedPages;
      pagesWithExperiments = storedPagesWithExperiments;
      hasFetchedExperiments = storedHasFetchedExperiments;
    }
  }

  function sendDataOnLeave() {
    window.addEventListener('beforeunload', () => {
      if (!isInternalNavigation) {
        const hasConvertedOrMounted = activeExperiments.some(
          (experiment) => experiment.converted || experiment.experimentMounted,
        );

        if (hasConvertedOrMounted) {
          const data = {
            visitorId,
            timeOnPage,
            clickCount,
            scrollDepth,
            idempotencyKey: visitorId, // not sure if this is right or needed
            activeExperiments,
            visitedPages,
            stellarVisitorId,
            // TODO-p2: Store session issues in the database, and perhaps do not count these sessions as valid. Or raise an issue on the FE of the exp about it
            sessionIssues,
          };

          // TODO-p2: Averiguar porque en mobile e incognito no sale el beacon.
          navigator.sendBeacon(
            `${STELLAR_API_URL}/experiments/end-session`,
            JSON.stringify(data),
          );
        }
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
    console.log('Running mountExperiments');
    const stellarData = getStellarData();
    const currentPageUrl = window.location.href;

    function processExperiments() {
      experiments.forEach((experiment) => {
        if (global__mountedOnThisPageLoad[experiment.id]) {
          console.log(`Skipping already mounted experiment: ${experiment.id}`);
          return;
        }

        if (
          getPathFromURL(window.location.href) !==
          getPathFromURL(experiment.url)
        ) {
          console.log(
            'Skipping experiment as it is not for this page :):',
            experiment,
          );
          return;
        }

        const storedVariantId = stellarData[experiment.id];
        let variantToUse = storedVariantId || experiment.variant_to_use;

        console.log(
          'Variant to use - storedVariantId || experiment.variant_to_use: ',
          variantToUse,
        );

        experiment.variants.forEach((variant) => {
          if (variant.id === variantToUse) {
            console.log('Matching variant found: ', variant);

            variant.modifications.forEach((modification) => {
              const targetElement = document.querySelector(
                modification.selector,
              );
              console.log('Modification target element: ', targetElement);

              if (targetElement) {
                targetElement.innerText = modification.innerText;
                targetElement.style.cssText = modification.cssText;
              } else {
                sessionIssues.push({
                  type: 'MODIFICATION',
                  message: `Element not found for selector: ${modification.selector}`,
                });
              }
            });

            if (!storedVariantId) {
              stellarData[experiment.id] = variant.id;
              setStellarData(stellarData);
            }

            if (
              experiment.goal.type === 'CLICK' &&
              (currentPageUrl.includes(experiment.goal.url_match_value) ||
                experiment.goal.url_match_value === '*')
            ) {
              const selectorElement = document.querySelector(
                experiment.goal.selector,
              );
              if (selectorElement) {
                selectorElement.addEventListener('click', function () {
                  const expRun = activeExperiments.find(
                    (e) =>
                      e.experiment === experiment.id &&
                      e.variant === variant.id,
                  );
                  if (expRun) {
                    expRun.converted = true;
                  }
                });
              }
            }

            global__mountedOnThisPageLoad[experiment.id] = true;
            activeExperiments.find(
              (e) => e.experiment === experiment.id,
            ).experimentMounted = true;
          }
        });
      });
    }

    const config = { childList: true, subtree: true };

    let debounceTimer;
    function debounceProcessExperiments() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        processExperiments();
      }, 10);
    }

    global__observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          debounceProcessExperiments();
        }
      });
    });

    global__observer.observe(document.body, config);

    debounceProcessExperiments();
  }

  function showLoadingState() {
    console.log('showLoadingState run!');
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
    console.log('fetchExperiments run! - ', hasFetchedExperiments);

    const pageUrl = window.location.href;
    if (
      !pagesWithExperiments.includes(pageUrl) && // This could be a good optimization, but needs better handling to avoid missing new experiments.
      visitedPages.length > 1 &&
      hasFetchedExperiments
    ) {
      return;
    }
    console.log('fetching!');

    const apiKey = getApiKey();

    try {
      let data;

      const cachedExperiments = getStellarCache();
      if (cachedExperiments) {
        data = cachedExperiments;
        console.log('Using cached experiments');
      } else {
        const response = await fetch(`${STELLAR_API_URL}/experiments/client`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        data = await response.json();
      }

      console.log('Datusarda: ', data);

      pagesWithExperiments = data.map((experiment) => experiment.url);

      global__experimentsToMount = data;

      activeExperiments = data.map((experiment) => {
        const stellarData = getStellarData();
        const storedVariantId = stellarData[experiment.id];
        return {
          experiment: experiment.id,
          variant: storedVariantId || experiment.variant_to_use,
          converted: false,
          experimentMounted: false,
          goalType: experiment.goal.type,
          goalElementUrl: experiment.goal.url_match_value,
          goalUrlMatchType: experiment.goal.url_match_type,
          goalUrlMatchValue: experiment.goal.url_match_value,
        };
      });

      setStellarCache(global__experimentsToMount);

      console.log('global__experimentsToMount', global__experimentsToMount);
      mountExperiments(global__experimentsToMount);
      trackPageVisit();
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
    console.log('track page visit run! ', activeExperiments);
    const currentPage = window.location.pathname;
    if (visitedPages.length === 1 && visitedPages[0] === currentPage) {
      return;
    }
    visitedPages.push(currentPage);
    updateSessionStorage();

    console.log('currentPage: ', currentPage);

    activeExperiments.forEach((experiment) => {
      console.log(
        'foriching: ',
        experiment,
        hasPageVisitGoalConverted(experiment),
      );
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

    history.pushState = function () {
      // We need to flush these on every page navigation
      global__mountedOnThisPageLoad = {};
      originalPushState.apply(this, arguments);
      trackPageVisit();
      if (global__experimentsToMount) {
        mountExperiments(global__experimentsToMount);
      }
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
    console.log('inicializamos caca');

    if (stellarMode === 'true') {
      return;
    }

    showLoadingState();
    function domContentLoadedActions() {
      restoreSessionData();
      wrapHistoryMethods();
      startTimeTracking();
      trackClicks();
      trackScrollDepth();
      sendDataOnLeave();
      fetchExperiments();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', domContentLoadedActions);
    } else {
      domContentLoadedActions();
    }
  }

  initializeScript();
})();
