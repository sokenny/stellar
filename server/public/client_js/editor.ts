(function () {
  const STELLAR_API_URL = 'http://localhost:3001/api';

  const urlParams = new URLSearchParams(window.location.search);
  const stellarMode = urlParams.get('stellarMode');
  const experimentId = urlParams.get('experimentId');
  const newExperiment = urlParams.get('newExperiment');
  const tempId = urlParams.get('tempId');
  const isSettingGoal = !!experimentId;
  const elementToHighlight = urlParams.get('elementToHighlight');
  const modificationType = urlParams.get('modificationType');
  const text = urlParams.get('text');

  if (stellarMode === 'true') {
    function getSelector(element) {
      if (element.id) {
        return `#${element.id}`;
      }

      let path = [];
      while (element && element.nodeType === Node.ELEMENT_NODE) {
        let selector = element.nodeName.toLowerCase();
        let sibling = element;
        let siblingIndex = 1;

        while (sibling.previousElementSibling) {
          sibling = sibling.previousElementSibling;
          siblingIndex++;
        }

        if (siblingIndex > 1) {
          selector += `:nth-child(${siblingIndex})`;
        }

        path.unshift(selector);
        element = element.parentElement;
      }

      return path.join(' > '); //
    }

    async function setClickGoal({ selector }) {
      console.log('esto corrio');
      const pageUrl = window.location.href.split('?')[0];
      const response = await fetch(STELLAR_API_URL + '/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experiment_id: experimentId,
          type: 'CLICK',
          selector,
          page_url: pageUrl,
        }),
      });

      return { status: response.status, data: await response.json() };
    }

    async function createNewExperiment({
      selector,
      properties,
      elementType,
      tempId,
    }) {
      console.log('properties que mandamos: ', properties);
      const response = await fetch(STELLAR_API_URL + '/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selector,
          properties,
          url: window.location.href,
          elementType,
          tempId,
        }),
      });

      return { status: response.status, data: await response.json() };
    }

    function highlightElement(element) {
      element.classList.add('stellar-selected');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function injectStyles(styles) {
      const styleSheet = document.createElement('style');
      styleSheet.type = 'text/css';
      styleSheet.innerText = styles;
      document.head.appendChild(styleSheet);
    }

    const styles = `
      .stellar-selected {
        padding: 4px 8px;
        border: 2px solid blue;
        background-color: rgba(0, 0, 255, 0.1);
      }

      .stellar-confirmation-prompt {
        position: fixed;
        background-color: white;
        border: 1px solid #ccc;
        padding: 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .stellar-confirmation-actions {
        display: flex;
        margin-top: 8px;
      }
      
      .stellar-confirmation-prompt button {
        margin: 5px;
      }
    `;

    injectStyles(styles);

    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        if (elementToHighlight) {
          const element: any = document.querySelector(elementToHighlight);
          if (element) {
            highlightElement(element);

            if (modificationType === 'text') {
              element.innerText = text;
            }
          } else {
            console.error('Element not found:', elementToHighlight);
          }
        }
      }
    };

    function handleElementSelection(event) {
      const selectedElements = document.querySelectorAll('.stellar-selected');
      selectedElements.forEach((element) => {
        element.classList.remove('stellar-selected');
      });
      const target = event.target as any;
      target.classList.add('stellar-selected');
    }

    document.addEventListener('contextmenu', (event) => {
      if (!isSettingGoal && !newExperiment) return;
      event.preventDefault();

      if (isSettingGoal) {
        handleElementSelection(event);
        const selector = getSelector(event.target);
        setTimeout(async () => {
          const confirmElement = confirm('Confirm element selection?');
          if (confirmElement) {
            const response = await setClickGoal({ selector });
            if (response.status === 200) {
              window.close();
            }
          } else {
            const target = event.target as any;
            target.classList.remove('stellar-selected');
          }
        }, 50);
      }

      if (newExperiment) {
        handleElementSelection(event);
        const target: any = event.target;
        const selector = getSelector(target);
        const properties = {
          color: window.getComputedStyle(target).color,
          fontSize: window.getComputedStyle(target).fontSize,
          fontWeight: window.getComputedStyle(target).fontWeight,
          innerText: target.innerText,
        };
        setTimeout(async () => {
          const confirmElement = confirm('Confirm element selection?');
          if (confirmElement) {
            const response = await createNewExperiment({
              selector,
              properties,
              elementType: target.nodeName,
              tempId,
            });
            console.log('la respuestaa: ', response);
            if (response.status === 200) {
              window.close();
            }
          } else {
            const target = event.target as any;
            target.classList.remove('stellar-selected');
          }
        }, 50);
      }
    });
  }
})();
