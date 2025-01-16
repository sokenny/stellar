(function () {
  const STELLAR_API_URL = 'process.env.STELLAR_API_URL/api';

  // TODO-p1-1: Confirm element selection is running twice.

  // TODO-pfuturo: Based on this chat with gpt, develop a functionality that allows to create copy variants from an initial widget.
  // https://chatgpt.com/c/d46cdac3-e1c5-4e2e-9833-b0e8bc50c24a
  // You enter 'create experiment flow' then enter the visual builder. Here you can select a card, hero section, etc. And we will send its html to gpt, have gpt send us variants and the selectors for these elements. From here the user can continue to make edits or save changes

  // TODO-p3: Add a prefix "global__" to global vars
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const stellarMode = urlParams.get('stellarMode');
  const experimentId = urlParams.get('experimentId');
  const variantId = urlParams.get('variantId');
  const isSettingGoal = urlParams.get('isSettingGoal');
  const elementToHighlight = urlParams.get('elementToHighlight');
  const modificationType = urlParams.get('modificationType');
  const text = urlParams.get('text');
  const visualEditorOn = urlParams.get('visualEditorOn');
  const previewMode = urlParams.get('previewMode');
  const fromUrl = urlParams.get('fromUrl');
  let editedElements = [];
  let elementsPristineState = {};
  let selectedElement = null;
  let loadingVariantCreation = false;
  let variantCreated = false;
  let globalCssText: string = '';
  let globalJsText: string = '';
  const globalStyleElement = document.createElement('style');
  document.head.appendChild(globalStyleElement);

  function showLoadingState(text) {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'stellar-loading';
    loadingElement.textContent = text;
    loadingElement.style.position = 'fixed';
    loadingElement.style.top = '0';
    loadingElement.style.left = '0';
    loadingElement.style.height = '100%';
    loadingElement.style.width = '100%';
    loadingElement.style.backgroundColor = 'white';
    loadingElement.style.zIndex = '9999';
    loadingElement.style.display = 'flex';
    loadingElement.style.justifyContent = 'center';
    loadingElement.style.alignItems = 'center';
    loadingElement.style.fontSize = '1.2rem';
    loadingElement.style.color = 'black';
    document.body.appendChild(loadingElement);
  }

  // We don't need anti flicker overlay in the editor for now
  if (
    (typeof (window as any).rmo === 'function' && visualEditorOn) ||
    isSettingGoal
  ) {
    try {
      (window as any).rmo();
    } catch (error) {
      console.error('Error executing rmo:', error);
    }
  }

  function hideLoadingState() {
    const loadingElement = document.getElementById('stellar-loading');
    if (loadingElement) {
      loadingElement.remove();
    }
  }

  function generateUniqueId() {
    return 'stellarElementId_' + Math.random().toString(36).substr(2, 9);
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

        if (element.parentElement && element.parentElement.id) {
          path.unshift(`#${element.parentElement.id}`);
          break;
        }

        element = element.parentElement;
      }

      const maxLevels = 5;
      const startIndex = Math.max(0, path.length - maxLevels);
      const limitedPath = path.slice(startIndex);

      return limitedPath.join(' > ');
    }

    async function setClickGoal({ selector }) {
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
          // TODO-p2: Make sure this is only the path
          url_match_value: pageUrl,
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
      
      .sve-success {
        background-color: #cfffdf!important;
        border: 1px solid #50c878!important;
      }

      .sve-success .change-indicator {
        display: none;
      }

      .sve-attribute-fields {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }

      .sve-attribute-fields .sve-src-field {
        flex: 2;
        min-width: 0;
      }

      .sve-attribute-fields .sve-dimension-field {
        flex: 1;
        min-width: 0;
      }

      .sve-attribute-fields label {
        display: block;
        margin-bottom: 2px;
        font-size: 10px;
        text-transform: uppercase;
      }

      .sve-attribute-fields input {
        width: 100%;
      }
    `;

    injectStyles(styles);

    function addHoverStyles() {
      document.addEventListener('mouseover', function (e) {
        injectStyles(`
          .stellar-hover-effect {
            outline: 2px solid blue !important;
          }
        `);

        document.querySelectorAll('.stellar-hover-effect').forEach((el) => {
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

    document.onreadystatechange = async () => {
      if (document.readyState === 'complete') {
        if (visualEditorOn === 'true' || isSettingGoal === 'true') {
          addHoverStyles();
        }

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
          if (variantId) {
            showLoadingState('Fetching variant...');
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
                const stellarElementId = generateUniqueId();
                if (element) {
                  element.setAttribute('stellar-element-id', stellarElementId);
                  elementsPristineState[stellarElementId] =
                    element.cloneNode(true);

                  // Only apply modifications that are explicitly defined
                  if (mod.innerText !== undefined) {
                    element.innerText = mod.innerText;
                  }
                  if (mod.cssText !== undefined) {
                    element.style.cssText = mod.cssText;
                  }

                  // Set attributes if they exist
                  if (mod.attributes) {
                    Object.keys(mod.attributes).forEach((attr) => {
                      if (mod.attributes[attr] !== undefined) {
                        element[attr] = mod.attributes[attr];
                      }
                    });
                  }

                  editedElements.push(stellarElementId);
                } else {
                  console.error('Element not found:', mod.selector);
                }
              });

              if (variant.global_css) {
                globalCssText = variant.global_css;
                updateGlobalStyles(globalCssText);
              }

              if (variant.global_js) {
                globalJsText = variant.global_js;
                const scriptElement = document.createElement('script');
                scriptElement.type = 'text/javascript';
                scriptElement.text = globalJsText;
                document.body.appendChild(scriptElement);
              }
            }

            initializeEditedElements(variant);
            hideLoadingState();
          }
          const styles = `.stellar-variant-editor { 
            position: fixed;
            background-color: white;
            width: 320px;
            height: 85vh;
            z-index: 10000;
            top: 50%;
            right: 40px;
            transform: translateY(-50%);
            border: 2px solid rgba(60, 146, 226, .25);
            border-radius: 4px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            overflow-y: auto;
          }

          @media (max-width: 720px) {
            .stellar-variant-editor {
              height: 60vh;
              overflow-y: auto;
              top: auto;
              bottom: 10%;
              transform: translateY(0);
            }
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
            width: 100%;
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

          @media (max-width: 720px) {
            #sve-save-variant {
              margin-bottom: 16px;
            }
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

          .sve-field-group textarea, #sve-global-code-textarea {
            resize: none;
          }

          #sve-global-code-textarea {
            height: 400px;
            font-size: 11px;
            font-family: monospace;
            line-height: 1.4;
            tab-size: 2;
            background-color: #f8f9fa;
            color: #212529;
          }

          .sve-field-group label {
            margin-bottom: 2px;
            text-transform: uppercase;
            font-size: 10px;
          }

          .sve-field-group input, .sve-field-group textarea, #sve-global-code-textarea {
            border: 1px solid rgba(0, 0, 0, 0.2);
            outline: none;
            padding: 4px;
            width: 100%;
          }

          .sve-global-buttons {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
            white-space: nowrap;
          }

          .sve-global-buttons button, #sve-cancel-global-code, #sve-save-global-code {
            width: 48%;
            font-size: 12px;
            padding: 8px 16px;
            border: none;
            cursor: pointer;
            background-color: rgba(60, 146, 226, 0.1);
            border: 1px solid rgba(60, 146, 226, .25);
          }

          #sve-cancel-global-code {
            background-color: rgba(255, 0, 0, 0.1);
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
          `;

          function actionsComponent() {
            const isSaveDisabled =
              (editedElements.length === 0 &&
                !globalCssText.trim() &&
                !globalJsText.trim()) ||
              loadingVariantCreation;
            return `<div class="sve-actions">
                    <button id="sve-save-variant" class="${
                      isSaveDisabled ? 'sve-disabled' : ''
                    }">Save And Finish</button>
                  </div>`;
          }

          function editedElementsComponent() {
            let editedElementsMarkup = '';
            for (let i = 0; i < editedElements.length; i++) {
              const el: any = document.querySelector(
                `[stellar-element-id="${editedElements[i]}"]`,
              );
              editedElementsMarkup += `<div class="sve-edited-element" stellar-element-id-ref="${editedElements[i]}">
                <div class="sve-edited-element-info"><b>${el.tagName}</b> - ${el.innerText}</div>
                <div class="sve-edited-element-delete" stellar-element-id-ref="${editedElements[i]}">x</div>
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
            const isImage = element && element.tagName === 'IMG';

            const isInitialState =
              editedElements.length === 0 && element === null;

            const globalButtons = `
              <div class="sve-field-group sve-global-buttons" style="margin-top: ${
                isInitialState ? '16px' : '0'
              };">
                <button id="sve-global-css">Edit Global CSS <span id="css-change-indicator" class="change-indicator" style="display: ${
                  globalCssText.trim() ? 'inline-block' : 'none'
                };">has changes</span></button>
                <button id="sve-global-js">Edit Global JS <span id="js-change-indicator" class="change-indicator" style="display: ${
                  globalJsText.trim() ? 'inline-block' : 'none'
                };">has changes</span></button>
              </div>
            `;

            let attributeFields = '';
            if (element) {
              if (element.tagName === 'IMG') {
                attributeFields = `
                  <div class="sve-field-group">
                    <label>Image Attributes</label>
                    <div class="sve-attribute-fields">
                      <div class="sve-src-field">
                        <label>Source URL</label>
                        <input type="text" id="stellar-src" placeholder="Source URL" value="${
                          element.src || ''
                        }">
                      </div>
                      <div class="sve-dimension-field">
                        <label>Width</label>
                        <input type="number" id="stellar-width" placeholder="Width" value="${
                          element.width || ''
                        }">
                      </div>
                      <div class="sve-dimension-field">
                        <label>Height</label>
                        <input type="number" id="stellar-height" placeholder="Height" value="${
                          element.height || ''
                        }">
                      </div>
                    </div>
                  </div>
                `;
              } else if (element.tagName === 'A') {
                attributeFields = `
                  <div class="sve-field-group">
                    <label>Link Attributes</label>
                    <div class="sve-attribute-fields">
                      <div class="sve-src-field">
                        <label>URL</label>
                        <input type="text" id="stellar-href" placeholder="Link URL" value="${
                          element.href || ''
                        }">
                      </div>
                    </div>
                  </div>
                `;
              }
            }

            if (isInitialState) {
              return `<div class="stellar-variant-editor sve-empty-state">
                <div>
                  <div class="sve-identity">STELLAR</div>
                  <div class="sve-instructions">Click on an element to start editing this page variant.</div>
                </div>
                ${globalButtons}
                <div id="sve-actions-entry-point"></div>
              </div>`;
            }

            return `<div class="stellar-variant-editor">
              <div class="sve-inner-wrapper">
                <div class="sve-fields">
                  ${attributeFields}
                  ${
                    !isImage
                      ? `
                    <div class="sve-field-group">
                      <label>Content</label>
                      <textarea id="stellar-element-content">${innerText}</textarea>
                    </div>
                  `
                      : ''
                  }
                  <div class="sve-hide-element">
                    <input type="checkbox" id="sve-hide-element" name="sve-hide-element" value="sve-hide-element" ${
                      isHidden ? 'checked' : ''
                    }>
                    <label for="sve-hide-element">Hide Element</label>
                  </div>
                  <div class="sve-double-field-group">
                    <div class="sve-field-group">
                      <label>Font Size (px)</label>
                      <input type="number" id="stellar-font-size" name="stellar-font-size" value="${fontSize}">
                    </div>
                    <div class="sve-field-group">
                      <label>Color</label>
                      <input type="color" id="stellar-color" name="stellar-color" value="${color.replace(
                        /\s/g,
                        '',
                      )}">
                    </div>
                  </div>
                  <div class="sve-field-group">
                    <label>Background Color</label>
                    <input type="color" id="stellar-background-color" name="stellar-background-color" value="${backgroundColor}">
                  </div>
                  <div class="sve-field-group">
                    <label>Custom Element CSS</label>
                    <textarea id="stellar-custom-element-css" name="stellar-custom-element-css" placeholder="color: red;"></textarea>
                  </div>
                  ${globalButtons}
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

          function handleDeleteEditedElement(stellarElementId) {
            const el: any = document.querySelector(
              `[stellar-element-id="${stellarElementId}"]`,
            );

            el.innerText = elementsPristineState[stellarElementId].innerText;

            const index = editedElements.indexOf(stellarElementId);
            if (index > -1) {
              editedElements.splice(index, 1);
            }

            const pristineStyle = elementsPristineState[stellarElementId].style;
            for (let i = 0; i < pristineStyle.length; i++) {
              const propName = pristineStyle[i];
              el.style[propName] = pristineStyle.getPropertyValue(propName);
            }

            elementsPristineState[stellarElementId] = null;

            renderEditor({ element: selectedElement });
          }

          async function handleSaveAndFinishVariant() {
            loadingVariantCreation = true;
            renderActions();
            const modifications = [];

            for (let i = 0; i < editedElements.length; i++) {
              const el = document.querySelector(
                `[stellar-element-id="${editedElements[i]}"]`,
              ) as HTMLElement;
              const pristineEl = elementsPristineState[
                editedElements[i]
              ] as HTMLElement;
              const modification: any = {
                selector: getSelector(el),
              };

              // Only include style changes if they differ from pristine state
              if (el?.style?.cssText !== pristineEl?.style?.cssText) {
                modification.cssText = el?.style?.cssText;
              }

              // Only include text changes if they differ from pristine state
              if (el?.innerText !== pristineEl?.innerText) {
                modification.innerText = el?.innerText;
              }

              // Handle specific attributes for images and links
              if (el.tagName === 'IMG') {
                const imgAttrs = {};
                ['src', 'width', 'height', 'srcset'].forEach((attr) => {
                  if (el[attr] !== pristineEl[attr]) {
                    imgAttrs[attr] = el[attr];
                  }
                });
                if (Object.keys(imgAttrs).length > 0) {
                  modification.attributes = imgAttrs;
                }
              } else if (el.tagName === 'A') {
                if (
                  (el as HTMLAnchorElement).href !==
                  (pristineEl as HTMLAnchorElement).href
                ) {
                  modification.attributes = {
                    href: (el as HTMLAnchorElement).href,
                  };
                }
              }

              // Only include modification if there are actual changes
              if (Object.keys(modification).length > 1) {
                // > 1 because selector is always included
                modifications.push(modification);
              }
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
                  globalCss: globalCssText,
                  globalJs: globalJsText,
                  experimentId, // NOTE: we might not need experimentId
                }),
              },
            );

            if (response.status === 200) {
              if (fromUrl) {
                window.location.href = `${fromUrl}?variantEdited=${variantId}`;
              } else {
                window.close();
              }
            }

            // Sometimes the window won't close so we perform the handling below
            loadingVariantCreation = false;
            variantCreated = true;
            renderEditor({ element: selectedElement });
          }

          function attachActionsListeners() {
            const saveVariant = document.getElementById('sve-save-variant');
            const globalCssButton = document.getElementById('sve-global-css');
            const globalJsButton = document.getElementById('sve-global-js');

            if (saveVariant) {
              saveVariant.addEventListener('click', function () {
                if (!this.classList.contains('sve-disabled')) {
                  handleSaveAndFinishVariant();
                }
              });
            }

            if (globalCssButton) {
              globalCssButton.addEventListener('click', function () {
                renderGlobalCodeEditor('css');
              });
            }

            if (globalJsButton) {
              globalJsButton.addEventListener('click', function () {
                renderGlobalCodeEditor('js');
              });
            }
          }

          function attachEditedElementsListeners() {
            const modifiedElements = document.querySelectorAll(
              '.sve-edited-element',
            );
            modifiedElements.forEach((el) => {
              el.addEventListener('click', function () {
                const attr = this.getAttribute('stellar-element-id-ref');
                const editedEl: any = document.querySelector(
                  `[stellar-element-id="${attr}"]`,
                );
                editedEl.click();
              });
            });

            const deleteEditedElement = document.querySelectorAll(
              '.sve-edited-element-delete',
            );
            deleteEditedElement.forEach((el) => {
              el.addEventListener('click', function (e) {
                e.stopPropagation();
                const attrVal = this.getAttribute('stellar-element-id-ref');
                handleDeleteEditedElement(attrVal);
              });
            });
          }

          function handleElementMutation() {
            const selectedElementNode = document.querySelector(selectedElement);
            const stellarElementId =
              selectedElementNode.getAttribute('stellar-element-id');

            if (selectedElement && !editedElements.includes(stellarElementId)) {
              const newStellarElementId = generateUniqueId();
              selectedElementNode.setAttribute(
                'stellar-element-id',
                newStellarElementId,
              );
              elementsPristineState[newStellarElementId] =
                selectedElementNode.cloneNode(true);
              editedElements.push(newStellarElementId);
            }
            renderEditedElements();
            renderActions();
          }

          function attachEditorListeners() {
            const el: any = document.querySelector('.stellar-variant-editor');

            let isDragging = false;
            let currentX;
            let currentY;
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;

            function dragStart(e) {
              // Get the current transform values before starting the drag
              const transform = window.getComputedStyle(el).transform;
              const matrix = new DOMMatrix(transform);
              xOffset = matrix.m41; // Get the current X translation
              yOffset = matrix.m42; // Get the current Y translation

              if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
              } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
              }

              isDragging = true;
            }

            function drag(e) {
              if (isDragging) {
                e.preventDefault();

                if (e.type === 'touchmove') {
                  currentX = e.touches[0].clientX - initialX;
                  currentY = e.touches[0].clientY - initialY;
                } else {
                  currentX = e.clientX - initialX;
                  currentY = e.clientY - initialY;
                }

                xOffset = currentX;
                yOffset = currentY;

                el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
              }
            }

            function dragEnd() {
              isDragging = false;
            }

            // Mouse events
            el.addEventListener('mousedown', dragStart);
            window.addEventListener('mousemove', drag);
            window.addEventListener('mouseup', dragEnd);

            // Touch events
            el.addEventListener('touchstart', dragStart);
            window.addEventListener('touchmove', drag);
            window.addEventListener('touchend', dragEnd);

            const textarea = document.getElementById(
              'stellar-element-content',
            ) as any;
            if (textarea) {
              textarea.addEventListener('input', function () {
                if (selectedElement) {
                  document.querySelector(selectedElement).innerText =
                    this.value;
                  handleElementMutation();
                }
              });
            }

            const hideElementCheckbox = document.getElementById(
              'sve-hide-element',
            ) as any;
            if (hideElementCheckbox) {
              hideElementCheckbox.addEventListener('change', function () {
                if (selectedElement) {
                  if (this.checked) {
                    document.querySelector(selectedElement).style.display =
                      'none';
                  } else {
                    document.querySelector(selectedElement).style.display = '';
                  }
                  handleElementMutation();
                }
              });
            }

            const fontSizeInput = document.getElementById(
              'stellar-font-size',
            ) as any;
            if (fontSizeInput) {
              fontSizeInput.addEventListener('input', function () {
                if (selectedElement) {
                  document.querySelector(selectedElement).style.fontSize =
                    this.value + 'px';
                  handleElementMutation();
                }
              });
            }

            const colorInput = document.getElementById('stellar-color') as any;
            if (colorInput) {
              colorInput.addEventListener('input', function () {
                if (selectedElement) {
                  document.querySelector(selectedElement).style.color =
                    this.value;
                  handleElementMutation();
                }
              });
            }

            const backgroundColorInput = document.getElementById(
              'stellar-background-color',
            ) as any;
            if (backgroundColorInput) {
              backgroundColorInput.addEventListener('input', function () {
                if (selectedElement) {
                  document.querySelector(
                    selectedElement,
                  ).style.backgroundColor = this.value;
                  handleElementMutation();
                }
              });
            }

            const customCssInput = document.getElementById(
              'stellar-custom-element-css',
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
                element.style.cssText += ';' + globalCssText;
              }

              customCssInput.addEventListener('input', function () {
                if (selectedElement) {
                  const globalCssTextEl = document.getElementById(
                    'stellar-custom-element-css',
                  ) as any;
                  globalCssText = globalCssTextEl.value;
                  applyStylesToElement(selectedElement);
                  handleElementMutation();
                }
              });
            }

            // Add new attribute listeners
            const srcInput = document.getElementById(
              'stellar-src',
            ) as HTMLInputElement;
            const widthInput = document.getElementById(
              'stellar-width',
            ) as HTMLInputElement;
            const heightInput = document.getElementById(
              'stellar-height',
            ) as HTMLInputElement;
            const hrefInput = document.getElementById(
              'stellar-href',
            ) as HTMLInputElement;

            if (srcInput) {
              srcInput.addEventListener('input', function () {
                if (selectedElement) {
                  const imgElement = document.querySelector(
                    selectedElement,
                  ) as HTMLImageElement;
                  imgElement.src = this.value;
                  // Also update srcset if it exists
                  if (imgElement.hasAttribute('srcset')) {
                    imgElement.srcset = this.value;
                  }
                  handleElementMutation();
                }
              });
            }

            if (widthInput) {
              widthInput.addEventListener('input', function () {
                if (selectedElement) {
                  const imgElement = document.querySelector(
                    selectedElement,
                  ) as HTMLImageElement;
                  imgElement.width = parseInt(this.value) || 0;
                  handleElementMutation();
                }
              });
            }

            if (heightInput) {
              heightInput.addEventListener('input', function () {
                if (selectedElement) {
                  const imgElement = document.querySelector(
                    selectedElement,
                  ) as HTMLImageElement;
                  imgElement.height = parseInt(this.value) || 0;
                  handleElementMutation();
                }
              });
            }

            if (hrefInput) {
              hrefInput.addEventListener('input', function () {
                if (selectedElement) {
                  const linkElement = document.querySelector(
                    selectedElement,
                  ) as HTMLAnchorElement;
                  linkElement.href = this.value;
                  handleElementMutation();
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

          function renderGlobalCodeEditor(type: 'css' | 'js') {
            const editor: any = document.querySelector(
              '.stellar-variant-editor',
            );
            if (editor) {
              const placeholderText =
                type === 'css'
                  ? '#element {\n  color: red;\n}'
                  : `// Example JS\nconsole.log('Hello, World!');`;

              editor.innerHTML = `
                <div class="sve-inner-wrapper">
                  <textarea id="sve-global-code-textarea" placeholder="${placeholderText}">${
                type === 'css' ? globalCssText : globalJsText
              }</textarea>
                  <div class="sve-actions">
                    <button id="sve-cancel-global-code">Cancel</button>
                    <button id="sve-save-global-code">Save</button>
                  </div>
                </div>
              `;
              attachCustomCodeListeners(type);
            }
          }

          function updateGlobalStyles(cssText) {
            globalStyleElement.innerText = cssText;
          }

          function attachCustomCodeListeners(type: 'css' | 'js') {
            const saveButton = document.getElementById('sve-save-global-code');
            const cancelButton = document.getElementById(
              'sve-cancel-global-code',
            );
            const textarea = document.getElementById(
              'sve-global-code-textarea',
            ) as HTMLTextAreaElement;

            if (saveButton) {
              saveButton.addEventListener('click', () => {
                if (type === 'css') {
                  globalCssText = textarea.value;
                  updateGlobalStyles(globalCssText);
                } else {
                  globalJsText = textarea.value;
                }
                renderEditor({ element: selectedElement });
              });
            }

            if (cancelButton) {
              cancelButton.addEventListener('click', () => {
                renderEditor({ element: selectedElement });
              });
            }
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

    function handleGoalElementSelection(event) {
      if (!isSettingGoal) return;

      event.preventDefault();
      event.stopPropagation();

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
          const target = event.target;
          target.classList.remove('stellar-selected');
        }
      }, 50);
    }

    document.addEventListener('click', handleGoalElementSelection);
    document.addEventListener('contextmenu', handleGoalElementSelection);
  }

  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(
    document.createTextNode(`
    .change-indicator {
        display: none;
        color: white;
        font-size: 8px;
        padding: 2px 4px;
        border-radius: 2px;
        background-color: rgba(60, 146, 226, 1);
        margin-top: 4px;
    }

    #sve-global-css, #sve-global-js {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  `),
  );
  document.head.appendChild(style);
})();
