(function () {
  const STELLAR_API_URL = 'http://localhost:3001/api';

  // TODO-pfuturo: Based on this chat with gpt, develop a functionality that allows to create copy variants from an initial widget.
  // https://chatgpt.com/c/d46cdac3-e1c5-4e2e-9833-b0e8bc50c24a
  // You enter 'create experiment flow' then enter the visual builder. Here you can select a card, hero section, etc. And we will send its html to gpt, have gpt send us variants and the selectors for these elements. From here the user can continue to make edits or save changes

  // TODO-p3: Add a prefix "global__" to global vars
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const stellarMode = urlParams.get('stellarMode');
  const experimentId = urlParams.get('experimentId');
  const variantId = urlParams.get('variantId');
  const newExperiment = urlParams.get('newExperiment');
  const tempId = urlParams.get('tempId');
  const projectId = urlParams.get('projectId');
  const isSettingGoal = urlParams.get('isSettingGoal');
  const elementToHighlight = urlParams.get('elementToHighlight');
  const modificationType = urlParams.get('modificationType');
  const text = urlParams.get('text');
  const visualEditorOn = urlParams.get('visualEditorOn');
  const previewMode = urlParams.get('previewMode');
  console.log('visualEditorOn: ', visualEditorOn);

  let editedElements = [];
  let elementsPristineState = {};
  let selectedElement = null;
  let loadingVariantCreation = false;
  let variantCreated = false;

  function showLoadingState(text) {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'stellar-loading';
    loadingElement.textContent = text;
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
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          experiment_id: experimentId,
          type: 'CLICK',
          selector,
          // TODO-p1-3: Make sure this is only the path
          url_match_value: pageUrl,
        }),
      });

      return { status: response.status, data: await response.json() };
    }

    async function createNewExperiment({ selector, properties, elementType }) {
      const response = await fetch(STELLAR_API_URL + '/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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

    document.onreadystatechange = async () => {
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

        if (
          (visualEditorOn === 'true' && experimentId) ||
          (previewMode === 'true' && experimentId)
        ) {
          let fetchingVariant = false;
          if (variantId) {
            showLoadingState('Fetching variant...');
            fetchingVariant = true;
            const response = await fetch(
              `${STELLAR_API_URL}/variant/${variantId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );
            const variant = await response.json();

            function initializeEditedElements(variant) {
              variant.modifications.forEach((mod) => {
                const element = document.querySelector(mod.selector);
                if (element) {
                  elementsPristineState[mod.selector] = element.cloneNode(true);
                  element.innerText = mod.innerText;
                  element.style.cssText = mod.cssText;
                  editedElements.push(mod.selector);
                } else {
                  console.error('Element not found:', mod.selector);
                }
              });
            }

            initializeEditedElements(variant);
            hideLoadingState();
          }
          let customCssText: any = '';
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
            background-color: rgba(60, 146, 226, 1);
            color: white;
          }

          #sve-save-variant.sve-disabled {
            background-color: rgba(60, 146, 226, .5);
            cursor: default;
          }

          #sve-save-variant:hover {
            background-color: rgba(60, 146, 226, .85);
          }

          #sve-save-variant.sve-disabled:hover {
            background-color: rgba(60, 146, 226, .5);
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

          function actionsComponent() {
            const isSaveDisabled =
              editedElements.length === 0 || loadingVariantCreation;
            return `<div class="sve-actions">
                  <button id="sve-save-variant" class="${
                    isSaveDisabled ? 'sve-disabled' : ''
                  }"">Save And Finish</button>
                </div>`;
          }

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

            if (editedElements.length === 0 && element === null) {
              return `<div class="stellar-variant-editor sve-empty-state">
                <div>
                  <div class="sve-identity">STELLAR</div>
                  <div class="sve-instructions">Click on an element to start editing this page variant.</div>
                </div>
              </div>`;
            }

            if (variantCreated) {
              return `<div class="stellar-variant-editor sve-empty-state">
                <div>
                  <div class="sve-identity">STELLAR</div>
                  <div class="sve-instructions">Variant created! You can close this tab :)</div>
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
                <div id="sve-actions-entry-point"></div>
              </div>
            </div>`;
          }

          function renderEditor({ element = null }) {
            const editor: any = document.querySelector(
              '.stellar-variant-editor',
            );
            let editorPosition = null;

            if (editor) {
              editorPosition = {
                top: editor.style.top,
                left: editor.style.left,
              };
              editor.remove();
            }

            document.body.innerHTML += editorComponent(element);
            renderEditedElements();
            renderActions();
            attachEditorListeners();

            if (editorPosition) {
              const newEditor: any = document.querySelector(
                '.stellar-variant-editor',
              );
              if (newEditor) {
                newEditor.style.top = editorPosition.top;
                newEditor.style.left = editorPosition.left;
              }
            }
          }

          function renderEditedElements() {
            const entryPoint = document.getElementById(
              'sve-edited-elements-entry-point',
            );
            if (entryPoint) {
              entryPoint.innerHTML = editedElementsComponent();
            }
            attachEditedElementsListeners();
          }

          function renderActions() {
            const entryPoint = document.getElementById(
              'sve-actions-entry-point',
            );
            if (entryPoint) {
              entryPoint.innerHTML = actionsComponent();
            }
            attachActionsListeners();
          }

          function handleDeleteEditedElement(selector) {
            const el = document.querySelector(selector);
            el.innerText = elementsPristineState[selector].innerText;
            const index = editedElements.indexOf(selector);
            if (index > -1) {
              editedElements.splice(index, 1);
            }
            Object.assign(el.style, elementsPristineState[selector].style);
            elementsPristineState[selector] = null;
            renderEditor({ element: selectedElement });
          }

          async function handleSaveAndFinishVariant() {
            console.log('edited! ', editedElements);
            loadingVariantCreation = true;
            renderActions();
            const modifications = [];
            for (let i = 0; i < editedElements.length; i++) {
              const el: any = document.querySelector(editedElements[i]);
              const newStyle = {
                selector: editedElements[i],
                cssText: el.style.cssText,
                innerText: el.innerText,
              };
              modifications.push(newStyle);
            }
            confirm('Are you sure you want to save this variant?');
            const response = await fetch(
              `${STELLAR_API_URL}/variant/${variantId}/modifications`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  modifications,
                  experimentId, // NOTE: we might not need experimentId
                }),
              },
            );

            if (response.status === 200) {
              window.close();
            }

            // Sometimes the window won't close so we perform the handling below
            loadingVariantCreation = false;
            variantCreated = true;
            renderEditor({ element: selectedElement });
          }

          function attachActionsListeners() {
            const saveVariant = document.getElementById('sve-save-variant');
            if (saveVariant) {
              saveVariant.addEventListener('click', function () {
                if (!this.classList.contains('sve-disabled')) {
                  handleSaveAndFinishVariant();
                }
              });
            }
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
            renderActions();
          }

          function attachEditorListeners() {
            const el: any = document.querySelector('.stellar-variant-editor');
            el.addEventListener('mousedown', function (e) {
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

            const textarea = document.getElementById(
              'stellar-element-content',
            ) as any;
            if (textarea) {
              textarea.addEventListener('input', function () {
                if (selectedElement) {
                  handleElementMutation();
                  document.querySelector(selectedElement).innerText =
                    this.value;
                }
              });
            }

            const hideElementCheckbox = document.getElementById(
              'sve-hide-element',
            ) as any;
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

            const fontSizeInput = document.getElementById(
              'stellar-font-size',
            ) as any;
            if (fontSizeInput) {
              fontSizeInput.addEventListener('input', function () {
                if (selectedElement) {
                  handleElementMutation();
                  document.querySelector(selectedElement).style.fontSize =
                    this.value + 'px';
                }
              });
            }

            const colorInput = document.getElementById('stellar-color') as any;
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
            ) as any;
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

            const customCssInput = document.getElementById(
              'stellar-custom-css',
            ) as any;
            if (customCssInput) {
              // This function handles not resetting the css set with individual style input fields
              function applyStylesToElement(selector) {
                const element = document.querySelector(selector) as any;
                if (!element) return;
                const stellarColorEl = document.getElementById(
                  'stellar-color',
                ) as any;
                element.style.color = stellarColorEl.value;
                const stellarFontSizeEl = document.getElementById(
                  'stellar-font-size',
                ) as any;
                element.style.fontSize = stellarFontSizeEl.value + 'px';
                element.style.cssText += ';' + customCssText;
              }

              customCssInput.addEventListener('input', function () {
                if (selectedElement) {
                  handleElementMutation();
                  const customCssTextEl = document.getElementById(
                    'stellar-custom-css',
                  ) as any;
                  customCssText = customCssTextEl.value;
                  if (selectedElement) {
                    applyStylesToElement(selectedElement);
                  }
                }
              });
            }
          }

          const style = document.createElement('style');
          style.type = 'text/css';
          style.appendChild(document.createTextNode(styles));
          document.head.appendChild(style);

          if (visualEditorOn === 'true') {
            renderEditor({});
          }

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

          if (visualEditorOn === 'true') {
            addoverStyles();
          }

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

          if (visualEditorOn === 'true') {
            handleClickBehaviour();
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
