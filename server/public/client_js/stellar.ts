(function () {
  'use strict';

  const STELLAR_API_URL = 'process.env.STELLAR_API_URL/public';

  const urlParams = new URLSearchParams(window.location.search);
  const stellarMode = urlParams.get('stellarMode');
  const sessionIssues = [];
  const debugging = urlParams.get('stellarDebugging');
  const scriptUrl = new URL((document as any).currentScript.src);
  const scriptParams = new URLSearchParams(scriptUrl.search);
  const scriptApiKey = scriptParams.get('apiKey');

  let global__experimentsToMount = null;
  let global__observer = null;
  let global__mountedOnThisPageLoad = {};

  if (!localStorage.getItem('stellarVisitorId')) {
    localStorage.setItem(
      'stellarVisitorId',
      'visitor_' + Date.now() + Math.random(),
    );
  }

  function removeAntiFlickerOverlay() {
    if (typeof (window as any).rmo === 'function') {
      try {
        (window as any).rmo();
      } catch (error) {
        console.error('Error executing rmo:', error);
      }
    }
  }

  function log(...args) {
    if (debugging) {
      console.log(...args);
    }
  }

  log('stellar version: 26-01-2025');

  function getPathFromURL(url) {
    const a = document.createElement('a');
    a.href = url;

    const pathname = a.pathname.endsWith('/') ? a.pathname : a.pathname + '/';
    return pathname.toLowerCase();
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
      const TTL = 10000; // 10 seconds // TODO-p1-1: Make this longer

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

  function getApiKeyWithRetry(maxAttempts = 40, intervalMs = 50) {
    if (scriptApiKey) {
      return Promise.resolve(scriptApiKey);
    }

    // TODO-p1-1: Deprecate the use of dataLayer
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const interval = setInterval(() => {
        attempts += 1;
        const apiKey = window?.dataLayer?.find(
          (item) => item.stellarApiKey,
        )?.stellarApiKey;

        if (apiKey) {
          clearInterval(interval);
          resolve(apiKey);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('Failed to retrieve stellarApiKey from dataLayer'));
        }
      }, intervalMs);
    });
  }

  function getVisitorId() {
    let visitorId = localStorage.getItem('stellarVisitorId');
    if (!visitorId) {
      const userAgent = window.navigator.userAgent.replace(/\D/g, '');
      visitorId = `session_${Date.now()}_${userAgent}`;
      localStorage.setItem('stellarVisitorId', visitorId);
    }
    return visitorId;
  }

  const visitorId = getVisitorId();

  let timeOnPage = 0;
  let clickCount = 0;
  let scrollDepth = 0;
  let activeExperiments = [];
  let visitedPages = [];

  let isInternalNavigation = false;
  let hasFetchedExperiments = false;

  let global__isSplitUrlRedirect = false;

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
      hasFetchedExperiments,
    };
    log('setting in cache', sessionData);
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
        hasFetchedExperiments: storedHasFetchedExperiments,
      } = JSON.parse(storedData);
      timeOnPage = storedTime;
      clickCount = storedClicks;
      scrollDepth = storedDepth;
      activeExperiments = storedExperiments;
      visitedPages = storedVisitedPages;
      hasFetchedExperiments = storedHasFetchedExperiments;
    }
  }

  function sendDataOnLeave() {
    window.addEventListener('beforeunload', () => {
      if (!isInternalNavigation && !global__isSplitUrlRedirect) {
        const hasConvertedOrMounted = activeExperiments.some(
          (experiment) => experiment.converted || experiment.visualized,
        );

        if (hasConvertedOrMounted) {
          const uniqueSessionIssues = [];
          const issueSet = new Set();

          sessionIssues.forEach((issue) => {
            const issueString = `${issue.type}-${issue.message}`;
            if (!issueSet.has(issueString)) {
              issueSet.add(issueString);
              uniqueSessionIssues.push(issue);
            }
          });

          const data = {
            visitorId,
            timeOnPage,
            clickCount,
            scrollDepth,
            idempotencyKey: visitorId, // not sure if this is needed
            // TODO-p1-1 Rename these to visualizedExperiments
            activeExperiments: activeExperiments.filter(
              (experiment) => experiment.visualized,
            ),
            visitedPages,
            sessionIssues: uniqueSessionIssues,
            userAgent: window?.navigator?.userAgent,
            sessionEndedAt: new Date().toISOString(), // This carries timezone info in ISO 8601 format (UTC)
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

  function replaceKeywordsWithParams(text) {
    const urlParams = new URLSearchParams(window.location.search);
    return text.replace(/{{(.*?)}}/g, (match, content) => {
      const [keyword, fallback] = content.split('||');
      return urlParams.get(keyword) || fallback || match;
    });
  }

  function getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      return 'tablet';
    }
    if (
      /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        userAgent,
      )
    ) {
      return 'mobile';
    }
    return 'desktop';
  }

  function hasValidTargetRules(experiment) {
    if (!experiment.targetRules || !experiment.targetRules.length) {
      return true;
    }

    const rules = experiment.targetRules[0].rules;

    // Check device targeting
    if (rules.device?.enabled) {
      const currentDevice = getDeviceType();
      if (!rules.device.include.includes(currentDevice)) {
        log(
          `Experiment ${experiment.id} not mounted: device ${currentDevice} not in target list ${rules.device.include}`,
        );
        return false;
      }
    }

    // Check country targeting
    if (rules.country?.enabled) {
      const userCountry = navigator.language.split('-')[1]?.toUpperCase() || '';
      if (rules.country.exclude.includes(userCountry)) {
        log(
          `Experiment ${experiment.id} not mounted: country ${userCountry} in exclude list`,
        );
        return false;
      }
      if (
        rules.country.include.length > 0 &&
        !rules.country.include.includes(userCountry)
      ) {
        log(
          `Experiment ${experiment.id} not mounted: country ${userCountry} not in include list`,
        );
        return false;
      }
    }

    return true;
  }

  function shouldMountExperimentForUrl(experiment) {
    const currentUrl = window.location.href;

    // Helper function to normalize URLs by removing trailing slashes
    const normalizeUrl = (url) => url.replace(/\/+$/, '');

    // If using basic URL targeting
    if (experiment.url) {
      return getPathFromURL(currentUrl) === getPathFromURL(experiment.url);
    }

    // If using advanced URL rules
    if (experiment.advanced_url_rules) {
      const { exclude, include } = experiment.advanced_url_rules;

      // Check exclude rules first
      if (exclude?.length > 0) {
        for (const rule of exclude) {
          if (rule.type === 'contains' && currentUrl.includes(rule.url)) {
            log(
              `Experiment ${experiment.id} not mounted: URL matches exclude rule (contains) ${rule.url}`,
            );
            return false;
          }
          if (
            rule.type === 'exact' &&
            normalizeUrl(currentUrl) === normalizeUrl(rule.url)
          ) {
            log(
              `Experiment ${experiment.id} not mounted: URL matches exclude rule (exact) ${rule.url}`,
            );
            return false;
          }
        }
      }

      // Check include rules
      if (include?.length > 0) {
        return include.some((rule) => {
          if (rule.type === 'contains' && currentUrl.includes(rule.url)) {
            return true;
          }
          if (
            rule.type === 'exact' &&
            normalizeUrl(currentUrl) === normalizeUrl(rule.url)
          ) {
            return true;
          }
          return false;
        });
      }

      // If no include rules specified, allow by default after exclude checks
      return true;
    }

    // If neither url nor advanced_url_rules are specified, allow by default
    return true;
  }

  function mountExperiments(experiments, callback = () => {}) {
    log('Running mountExperiments');
    const stellarData = getStellarData();
    const currentPageUrl = window.location.href;

    function processExperiments() {
      experiments.forEach((experiment) => {
        if (global__mountedOnThisPageLoad[experiment.id]) {
          log(`Skipping already mounted experiment: ${experiment.id}`);
          return;
        }

        if (!hasValidTargetRules(experiment)) {
          return;
        }

        if (!shouldMountExperimentForUrl(experiment)) {
          log('Skipping experiment due to URL targeting rules:', experiment);
          return;
        }

        const storedVariantId = stellarData[experiment.id];
        let variantToUse = storedVariantId || experiment.variant_to_use;

        log('Variant to use: ', variantToUse);
        function handleVisualized(variant) {
          if (variant.global_css) {
            activeExperiments.find(
              (e) => e.experiment === experiment.id,
            ).visualized = true;
            log('global_css found! visualized is now true');
          }

          if (variant.global_js) {
            activeExperiments.find(
              (e) => e.experiment === experiment.id,
            ).visualized = true;
            log('global_js found! visualized is now true');
          }

          variant.modifications.forEach((modification) => {
            const targetElements = document.querySelectorAll(
              modification.selector,
            );
            if (targetElements.length > 0) {
              const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    const expRun = activeExperiments.find(
                      (e) => e.experiment === experiment.id,
                    );
                    if (expRun) {
                      expRun.visualized = true;
                      log('experiment visualized!', expRun.visualized);
                    }
                    log('disconnecting observer', activeExperiments);
                    observer.disconnect();
                  }
                });
              });

              targetElements.forEach((element) => {
                observer.observe(element);
              });
            }
          });
        }

        experiment.variants.forEach((variant) => {
          handleVisualized(variant);
          if (variant.id === variantToUse) {
            log('Matching variant found: ', variant);

            if (variant.global_css) {
              log('global_css found: ', variant.global_css);
              const styleElement = document.createElement('style');
              styleElement.textContent = variant.global_css;
              document.head.appendChild(styleElement);
            }

            if (variant.global_js) {
              log('global_js found: ', variant.global_js);
              const scriptElement = document.createElement('script');
              scriptElement.textContent = variant.global_js;
              document.body.appendChild(scriptElement);
            }

            variant.modifications.forEach((modification) => {
              const targetElements = document.querySelectorAll(
                modification.selector,
              );
              log('Modification target elements: ', targetElements);

              if (targetElements.length > 0) {
                // Only apply modifications that are explicitly defined
                if (modification.innerText !== undefined) {
                  targetElements.forEach((targetElement) => {
                    targetElement.innerText = replaceKeywordsWithParams(
                      modification.innerText,
                    );
                  });
                }

                if (modification.innerHTML !== undefined) {
                  targetElements.forEach((targetElement) => {
                    targetElement.innerHTML = replaceKeywordsWithParams(
                      modification.innerHTML,
                    );
                  });
                }

                if (modification.cssText !== undefined) {
                  targetElements.forEach((targetElement) => {
                    targetElement.style.cssText = modification.cssText;
                  });
                }

                // Set attributes if they exist
                if (modification.attributes) {
                  targetElements.forEach((targetElement) => {
                    Object.keys(modification.attributes).forEach((attr) => {
                      if (modification.attributes[attr] !== undefined) {
                        targetElement[attr] = modification.attributes[attr];
                      }
                    });
                  });
                }
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
              const selectorElements = document.querySelectorAll(
                experiment.goal.selector,
              );
              if (selectorElements.length > 0) {
                selectorElements.forEach((selectorElement) => {
                  selectorElement.addEventListener('click', function () {
                    const expRun = activeExperiments.find(
                      (e) =>
                        e.experiment === experiment.id &&
                        e.variant === variant.id,
                    );
                    if (expRun) {
                      expRun.converted = experiment.goal.GoalExperiment.is_main;
                      expRun.conversions.push(experiment.goal.id);
                    }
                  });
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
        if (callback) {
          callback();
        }
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

  let loadingTimeout;

  // TODO-maybe: Perhaps avoid fetching experiments if we already have fetched them and available in localStorage. But this should have a TTL or something.
  async function fetchExperiments() {
    log('fetchExperiments run! - ', hasFetchedExperiments);

    const apiKey = await getApiKeyWithRetry();

    try {
      let data;

      const cachedExperiments = getStellarCache();
      log('cachedExperiments!: ', cachedExperiments);
      if (cachedExperiments) {
        data = cachedExperiments;
        if (cachedExperiments.length == 0) {
          log('removeAntiFlickerOverlay 2');
          removeAntiFlickerOverlay();
          return;
        }
        log('Using cached experiments');
      } else {
        if (!apiKey) {
          console.error('No API key found - skipping experiments fetch');
          removeAntiFlickerOverlay();
          return;
        }

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

      log('Experiments data retrieved: ', data);

      global__experimentsToMount = data;

      activeExperiments = data.map((experiment) => {
        const stellarData = getStellarData();
        const storedVariantId = stellarData[experiment.id];

        return {
          experiment: experiment.id,
          variant: storedVariantId || experiment.variant_to_use,
          converted:
            activeExperiments.find((exp) => exp.experiment === experiment.id)
              ?.converted || false,
          conversions:
            activeExperiments.find((exp) => exp.experiment === experiment.id)
              ?.conversions || [], // This will later be stored in a sessions_conversions table for more powerful analytics
          experimentMounted: activeExperiments.some((exp) => {
            return exp.experiment === experiment.id && exp.experimentMounted;
          }),
          visualized: !experiment.smart_trigger, // If smart_trigger is set, we initialize to false, because we will wait for observer to trigger visualized to true
          goalType: experiment.goal.type,
          goalElementUrl: experiment.goal.url_match_value,
          goalUrlMatchType: experiment.goal.url_match_type,
          goalUrlMatchValue: experiment.goal.url_match_value,
        };
      });

      setStellarCache(global__experimentsToMount);
      log('global__experimentsToMount', global__experimentsToMount);

      const splitUrlExperimentsToMount = global__experimentsToMount.filter(
        (experiment) => experiment.type === 'SPLIT_URL',
      );
      const abExperimentsToMount = global__experimentsToMount.filter(
        (experiment) => experiment.type === 'AB',
      );

      // Mount split URL experiments first
      mountSplitUrlExperiments(splitUrlExperimentsToMount);

      // Then mount AB experiments
      mountExperiments(abExperimentsToMount, removeAntiFlickerOverlay);
      trackPageVisit();
    } catch (error) {
      console.error('Error fetching experiments:', error);
      removeAntiFlickerOverlay();
    }
  }

  function hasPageVisitGoalConverted(experiment) {
    const fullDataExperiment = global__experimentsToMount.find(
      (e) => e.id === experiment.experiment,
    );
    const pageVisitGoals = fullDataExperiment.goals.filter(
      (goal) => goal.type === 'PAGE_VISIT',
    );

    log('pageVisitGoals ', pageVisitGoals);

    const currentPage = window.location.href;
    const convertedGoals = [];
    for (const goal of pageVisitGoals) {
      if (
        goal.url_match_type === 'CONTAINS' &&
        currentPage.includes(goal.url_match_value)
      ) {
        log('converted goal! ', goal);
        convertedGoals.push(goal);
      }
      if (
        goal.url_match_type === 'EXACT' &&
        currentPage === goal.url_match_value
      ) {
        log('converted goal! ', goal);
        convertedGoals.push(goal);
      }
    }
    return convertedGoals;
  }

  function trackPageVisit() {
    log('track page visit run! ', activeExperiments);
    const currentPage = window.location.pathname + window.location.search;

    visitedPages.push(currentPage);

    log('currentPage: ', currentPage);

    activeExperiments.forEach((experiment) => {
      log('foriching: ', experiment, hasPageVisitGoalConverted(experiment));
      const convertedGoals = hasPageVisitGoalConverted(experiment);
      if (convertedGoals.length > 0) {
        log('convertedGoals! ', convertedGoals);
        experiment.converted = convertedGoals.some(
          (goal) => goal.GoalExperiment.is_main,
        );
        convertedGoals.forEach((goal) => {
          experiment.conversions.push(goal.id);
        });
      }
    });
    isInternalNavigation = false;
  }

  // Wrap history methods to detect SPA navigation
  function wrapHistoryMethods() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    function remountExperiments() {
      // We need to flush these on every page navigation
      global__mountedOnThisPageLoad = {};

      if (global__experimentsToMount) {
        const splitUrlExperiments = global__experimentsToMount.filter(
          (experiment) => experiment.type === 'SPLIT_URL',
        );
        const abExperiments = global__experimentsToMount.filter(
          (experiment) => experiment.type === 'AB',
        );

        // Mount split URL experiments first
        mountSplitUrlExperiments(splitUrlExperiments);
        // Then mount AB experiments
        mountExperiments(abExperiments);
      }
    }

    history.pushState = function () {
      log('Stellar: pushState called');
      originalPushState.apply(this, arguments);
      // Add small delay to ensure URL has updated
      setTimeout(() => {
        log('Stellar: pushState timeout triggered');
        trackPageVisit();
        remountExperiments();
      }, 50);
    };

    history.replaceState = function () {
      log('Stellar: replaceState called');
      originalReplaceState.apply(this, arguments);
      setTimeout(() => {
        log('Stellar: replaceState timeout triggered');
        trackPageVisit();
        remountExperiments();
      }, 50);
    };

    // Listen for both popstate and the custom navigation event
    ['popstate', 'locationchange'].forEach((event) => {
      window.addEventListener(event, function () {
        log(`Stellar: ${event} triggered`);
        setTimeout(() => {
          trackPageVisit();
          remountExperiments();
        }, 50);
      });
    });

    // Create a custom event for navigation changes
    let oldHref = window.location.href;
    const observer = new MutationObserver(function (mutations) {
      if (oldHref !== window.location.href) {
        log(
          'Stellar: URL changed from observer:',
          oldHref,
          'to',
          window.location.href,
        );
        oldHref = window.location.href;
        window.dispatchEvent(new Event('locationchange'));
      }
    });

    observer.observe(document, {
      subtree: true,
      childList: true,
    });
  }

  function initializeScript() {
    log('inicializamos caca');

    if (stellarMode === 'true') {
      return;
    }

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

  function mountSplitUrlExperiments(experiments) {
    log('Running mountSplitUrlExperiments');
    const stellarData = getStellarData();
    const currentUrl = window.location.href;

    experiments.forEach((experiment) => {
      if (global__mountedOnThisPageLoad[experiment.id]) {
        log(`Skipping already mounted split URL experiment: ${experiment.id}`);
        return;
      }

      if (!hasValidTargetRules(experiment)) {
        return;
      }

      const storedVariantId = stellarData[experiment.id];
      const variantToUse = storedVariantId || experiment.variant_to_use;
      const selectedVariant = experiment.variants.find(
        (v) => v.id === variantToUse,
      );
      log('Variant to use: ', selectedVariant);

      // Find if we're on the control URL (experiment.url)
      if (shouldMountExperimentForUrl(experiment)) {
        log('On control URL, checking if redirect needed');

        // If we're on control URL and have a non-control variant to use, redirect
        if (
          selectedVariant &&
          selectedVariant.url &&
          selectedVariant.url !== experiment.url
        ) {
          let redirectUrl = selectedVariant.url;
          if (selectedVariant.preserve_url_params) {
            const currentParams = new URLSearchParams(window.location.search);
            const variantUrlObj = new URL(selectedVariant.url);
            currentParams.forEach((value, key) => {
              variantUrlObj.searchParams.set(key, value);
            });
            redirectUrl = variantUrlObj.toString();
          }
          log(`Redirecting to variant URL: ${redirectUrl}`);
          global__isSplitUrlRedirect = true;
          window.location.href = redirectUrl;
          return;
        }
        log('no redirect needed');
      }

      // If we're on the variant URL, mark as visualized
      if (
        selectedVariant &&
        selectedVariant.url &&
        currentUrl.includes(selectedVariant.url)
      ) {
        log('On variant URL, marking as visualized');
        const expRun = activeExperiments.find(
          (e) => e.experiment === experiment.id,
        );
        if (expRun) {
          expRun.visualized = true;
          global__mountedOnThisPageLoad[experiment.id] = true;
          expRun.experimentMounted = true;
        }

        log('activeExperiments now', activeExperiments);

        // Store the variant ID if not already stored
        if (!storedVariantId) {
          stellarData[experiment.id] = variantToUse;
          setStellarData(stellarData);
        }
      }
    });
  }

  initializeScript();
})();
