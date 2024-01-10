(function () {
  const STELLAR_API_URL = 'http://localhost:3001/api';

  const urlParams = new URLSearchParams(window.location.search);
  const stellarMode = urlParams.get('stellarMode');
  const experimentId = urlParams.get('experimentId');
  const isSettingGoal = !!experimentId;
  const elementToHighlight = urlParams.get('elementToHighlight');

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

    async function setClickGoal(selector) {
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
          const element = document.querySelector(elementToHighlight);
          if (element) {
            highlightElement(element);
          } else {
            console.error('Element not found:', elementToHighlight);
          }
        }
      }
    };

    document.addEventListener('contextmenu', (event) => {
      if (!isSettingGoal) return;
      event.preventDefault();
      const selectedElements = document.querySelectorAll('.stellar-selected');
      selectedElements.forEach((element) => {
        element.classList.remove('stellar-selected');
      });
      const target = event.target as any;
      target.classList.add('stellar-selected');

      const selector = getSelector(event.target);

      setTimeout(async () => {
        const confirmElement = confirm('Confirm element selection?');
        if (confirmElement) {
          const response = await setClickGoal(selector);
          if (response.status === 200) {
            window.close();
          }
        } else {
          const target = event.target as any;
          target.classList.remove('stellar-selected');
        }
      }, 50);
    });
  }
})();
