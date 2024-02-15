(function () {
  const STELLAR_API_URL = 'http://localhost:3001/api';

  const urlParams = new URLSearchParams(window.location.search);
  const stellarMode = urlParams.get('stellarMode');
  const experimentId = urlParams.get('experimentId');
  const newExperiment = urlParams.get('newExperiment');
  const tempId = urlParams.get('tempId');
  const projectId = urlParams.get('projectId');
  const isSettingGoal = !!experimentId;
  const elementToHighlight = urlParams.get('elementToHighlight');
  const modificationType = urlParams.get('modificationType');
  const text = urlParams.get('text');
  const visualEditorOn = urlParams.get('visualEditorOn');
  console.log('visualEditorOn: ', visualEditorOn);

  let editedElements = [];
  let elementsPristineState = {};
  let selectedElement = null;

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

    async function createNewExperiment({ selector, properties, elementType }) {
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
          projectId,
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

        if (visualEditorOn === 'true') {
          console.log('We at home baby!');
          const styles = `.stellar-variant-editor { 
            position: fixed;
            background-color: white;
            width: 250px;
            height: 80vh;
            z-index: 10000;
            top: 50%;
            right: 40px;
            transform: translateY(-50%);
            border: 2px solid rgba(60, 146, 226, .25);
            border-radius: 4px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .sve-empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .sve-identity {
            font-size: 12px;
            font-weight: 800;
          }

          .sve-inner-wrapper {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
          }

          .sve-instructions {
            text-align: center;
          }

          .sve-edited-elements-title {
            font-size: 14px;
            margin-bottom: 8px;
          }

          .sve-edited-element {
            display: flex;
            justify-content: space-between;
            background-color: red;
            padding: 4px 8px;
            font-size: 12px;
            border-radius: 4px;
            margin-bottom: 4px;
            cursor: pointer;
            background-color: rgba(60, 146, 226, 0.1);
            border: 1px solid rgba(60, 146, 226, .25);
          }

          .sve-edited-element-info {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .sve-edited-element:hover {
            background-color: rgba(60, 146, 226, 0.15);
          }

          .sve-edited-element-delete {
            cursor: pointer;
            margin-left: 4px;
            color: rgba(60, 146, 226, 0.7);
          }

          .sve-edited-element-delete:hover {
            color: rgba(60, 146, 226, 1);
          }

          .sve-actions {
            display: flex;
            justify-content: space-between;
          }

          .sve-actions button {
            padding: 8px 16px;
            border: none;
            width: 100%;
            margin-right: 8px;
            cursor: pointer;
          }

          #sve-save-variant {
            background-color: #3c92e2;
            color: white;
          }

          .sve-actions button:last-child {
            margin-right: 0;
          }

          .sve-double-field-group {
            display: flex;
            justify-content: space-between;
          }

          .sve-double-field-group .sve-field-group {
            width: 48%;
          }

          .sve-field-group {
            display: flex;
            flex-direction: column;
            margin-bottom: 16px;
          }

          .sve-field-group textarea {
            resize: none;
          }

          .sve-field-group label {
            margin-bottom: 2px;
            text-transform: uppercase;
            font-size: 10px;
          }

          .sve-field-group input, .sve-field-group textarea {
            border: 1px solid rgba(0, 0, 0, 0.2);
            outline: none;
            padding: 4px;
            width: 100%;
          }

          .sve-hide-element {
            display: flex;
            align-items: center;
            font-size: 12px;
            margin-bottom: 16px;
          }

          .sve-hide-element input {
            margin-right: 8px;
          }
          
          .stellar-hover-effect {
            outline: 2px solid blue !important;
          }
          `;

          function editedElementsComponent() {
            let editedElementsMarkup = '';
            for (let i = 0; i < editedElements.length; i++) {
              const el: any = document.querySelector(editedElements[i]);
              editedElementsMarkup += `<div class="sve-edited-element" data-selector="${editedElements[i]}">
                <div class="sve-edited-element-info"><b>${el.tagName}</b> - ${el.innerText}</div>
                <div class="sve-edited-element-delete" data-selector="${editedElements[i]}">x</div>
              </div>`;
            }

            if (editedElements.length === 0) {
              return '';
            }

            return `<div class="sve-edited-elements">
                  <div class="sve-edited-elements-title">Edited Elements (${editedElements.length})</div>
                  <div class="sve-edited-elements-list">
                    ${editedElementsMarkup}
                  </div>
                </div>`;
          }

          function editorComponent(elementSelector) {
            const element = document.querySelector(elementSelector);
            const innerText = element ? element.innerText : '';
            const style = element ? window.getComputedStyle(element) : null;
            const fontSize = style ? parseInt(style.fontSize) : '';
            const color = style ? style.color : '';
            const backgroundColor = style ? style.backgroundColor : '';
            const isHidden = style ? style.display === 'none' : false;

            console.log('edited elements!! ', editedElements);

            if (editedElements.length === 0 && element === null) {
              return `<div class="stellar-variant-editor sve-empty-state">
                <div>
                  <div class="sve-identity">STELLAR</div>
                  <div class="sve-instructions">Click on an element to start editing this page variant.</div>
                </div>
              </div>`;
            }

            return `<div class="stellar-variant-editor">
              <div class="sve-inner-wrapper">
                <div class="sve-fields">
                  <div class="sve-field-group">
                    <label>Content</label>
                    <textarea value="${innerText}" id="stellar-element-content">${innerText}</textarea>
                  </div>
                  <div class="sve-hide-element">
                    <input type="checkbox" id="sve-hide-element" name="sve-hide-element" value="sve-hide-element" ${
                      isHidden ? 'checked' : ''
                    }>
                    <label for="sve-hide-element">Hide Element</label>
                  </div>
                  <div class="sve-double-field-group">
                    <div class="sve-field-group">
                      <label>Font Size (px)</label>
                      <input type="number" id="stellar-font-size" name="stellar-font-size" value=${fontSize}>
                    </div>
                    <div class="sve-field-group">
                      <label>Color</label>
                      <input type="color" id="stellar-color" name="stellar-color" value=${color.replace(
                        /\s/g,
                        '',
                      )}>
                    </div>
                  </div>
                  <div class="sve-field-group">
                    <label>Background Color</label>
                    <input type="color" id="stellar-background-color" name="stellar-background-color" value=${backgroundColor}>
                  </div>
                  <div class="sve-field-group">
                    <label>Custom CSS</label>
                    <textarea id="stellar-custom-css" name="stellar-custom-css"></textarea>
                  </div>
                  <div id="sve-edited-elements-entry-point"></div>
                </div>
                <div class="sve-actions">
                  <button id="sve-save-variant">Save</button>
                  <button id="sve-cancel-variant">Cancel</button>
                </div>
              </div>
            </div>`;
          }

          function renderEditor({ element = null }) {
            const editor = document.querySelector('.stellar-variant-editor');
            if (editor) {
              editor.remove();
            }
            document.body.innerHTML += editorComponent(element);
            renderEditedElements();
            attachEditorFieldsListeners();
          }

          function renderEditedElements() {
            const editedElementsComponentMarkup = editedElementsComponent();
            const entryPoint = document.getElementById(
              'sve-edited-elements-entry-point',
            );
            if (entryPoint) {
              entryPoint.innerHTML = editedElementsComponentMarkup;
            }
            attachEditedElementsListeners();
          }

          function handleDeleteEditedElement(selector) {
            // make style changes
            const el = document.querySelector(selector);
            el.innerText = elementsPristineState[selector].innerText;
            const index = editedElements.indexOf(selector);
            if (index > -1) {
              editedElements.splice(index, 1);
            }
            elementsPristineState[selector] = null;
            renderEditor({ element: selectedElement });
          }

          function attachEditedElementsListeners() {
            const modifiedElements = document.querySelectorAll(
              '.sve-edited-element',
            );
            modifiedElements.forEach((el) => {
              el.addEventListener('click', function () {
                const selector = this.getAttribute('data-selector');
                document.querySelector(selector).click();
              });
            });

            const deleteEditedElement = document.querySelectorAll(
              '.sve-edited-element-delete',
            );
            deleteEditedElement.forEach((el) => {
              el.addEventListener('click', function (e) {
                e.stopPropagation();
                const selector = this.getAttribute('data-selector');
                console.log('cliqueado! ', selector);
                handleDeleteEditedElement(selector);
              });
            });
          }

          function handleElementMutation() {
            if (selectedElement && !editedElements.includes(selectedElement)) {
              elementsPristineState[selectedElement] = document
                .querySelector(selectedElement)
                .cloneNode(true);
              editedElements.push(selectedElement);
            }
            renderEditedElements();
          }

          function attachEditorFieldsListeners() {
            const textarea = document.getElementById('stellar-element-content');
            if (textarea) {
              textarea.addEventListener('input', function () {
                if (selectedElement) {
                  handleElementMutation();
                  document.querySelector(selectedElement).innerText =
                    this.value;
                }
              });
            }

            const hideElementCheckbox =
              document.getElementById('sve-hide-element');
            if (hideElementCheckbox) {
              hideElementCheckbox.addEventListener('change', function () {
                if (selectedElement) {
                  handleElementMutation();
                  if (this.checked) {
                    document.querySelector(selectedElement).style.display =
                      'none';
                  } else {
                    document.querySelector(selectedElement).style.display = '';
                  }
                }
              });
            }

            const fontSizeInput = document.getElementById('stellar-font-size');
            if (fontSizeInput) {
              fontSizeInput.addEventListener('input', function () {
                if (selectedElement) {
                  handleElementMutation();
                  document.querySelector(selectedElement).style.fontSize =
                    this.value + 'px';
                }
              });
            }

            const colorInput = document.getElementById('stellar-color');
            if (colorInput) {
              colorInput.addEventListener('input', function () {
                if (selectedElement) {
                  handleElementMutation();
                  document.querySelector(selectedElement).style.color =
                    this.value;
                }
              });
            }

            const backgroundColorInput = document.getElementById(
              'stellar-background-color',
            );
            if (backgroundColorInput) {
              backgroundColorInput.addEventListener('input', function () {
                if (selectedElement) {
                  handleElementMutation();
                  document.querySelector(
                    selectedElement,
                  ).style.backgroundColor = this.value;
                }
              });
            }

            const customCssInput =
              document.getElementById('stellar-custom-css');
            if (customCssInput) {
              customCssInput.addEventListener('input', function () {
                if (selectedElement) {
                  handleElementMutation();
                  document.querySelector(selectedElement).style.cssText =
                    this.value;
                }
              });
            }
          }

          const style = document.createElement('style');
          style.type = 'text/css';
          style.appendChild(document.createTextNode(styles));
          document.head.appendChild(style);
          renderEditor({});

          function addoverStyles() {
            document.addEventListener('mouseover', function (e) {
              document
                .querySelectorAll('.stellar-hover-effect')
                .forEach((el) => {
                  el.classList.remove('stellar-hover-effect');
                });

              let target: any = e.target;
              let isVariantEditorOrChild = false;

              while (target && target !== document) {
                if (target.classList.contains('stellar-variant-editor')) {
                  isVariantEditorOrChild = true;
                  break;
                }
                target = target.parentNode;
              }

              target = e.target;

              if (!isVariantEditorOrChild) {
                while (target && target !== document) {
                  if (target.matches('*:not(body, html)')) {
                    target.classList.add('stellar-hover-effect');
                    break;
                  }
                  target = target.parentNode;
                }
              }
            });
          }
          addoverStyles();

          function handleClickBehaviour() {
            document.addEventListener(
              'click',
              function (e) {
                let target: any = e.target;

                // Check if the target or any of its parents is .stellar-variant-editor
                while (target != null && target !== document) {
                  if (target.classList.contains('stellar-variant-editor')) {
                    return; // Stop the function if click is inside .stellar-variant-editor
                  }
                  target = target.parentNode;
                }

                console.log('Element clicked:', e.target);
                e.preventDefault();
                e.stopPropagation();

                // Proceed with updating the selectedElement and rendering the editor
                selectedElement = getSelector(e.target);
                renderEditor({ element: selectedElement });
              },
              true,
            );
          }

          handleClickBehaviour();

          const el: any = document.querySelector('.stellar-variant-editor');
          // Allow freely moving editor
          el.addEventListener('mousedown', function (e) {
            console.log('mousedown');
            var offsetX =
              e.clientX - parseInt(window.getComputedStyle(this).left);
            var offsetY =
              e.clientY - parseInt(window.getComputedStyle(this).top);

            function mouseMoveHandler(e) {
              el.style.top = e.clientY - offsetY + 'px';
              el.style.left = e.clientX - offsetX + 'px';
            }

            function reset() {
              window.removeEventListener('mousemove', mouseMoveHandler);
              window.removeEventListener('mouseup', reset);
            }

            window.addEventListener('mousemove', mouseMoveHandler);
            window.addEventListener('mouseup', reset);
          });
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
