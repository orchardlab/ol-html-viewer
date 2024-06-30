export class HTMLViewer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Initialize shadow DOM with a hidden slot element
    this.shadowRoot.innerHTML = `
         <style>
           slot[name="content"] {
             display: none;
           }
           .control-panel {
              margin-bottom: 10px;
           }
         </style>
         <div class="control-panel">
               <label>
                 <input type="checkbox" id="toggle-images"> Show Images
               </label>
        </div>
         <slot name="content"></slot>
       `;
  }

  connectedCallback() {
    this.initCheckbox();
    this.parseHTMLContent();
  }

  initCheckbox() {
    const checkbox = this.shadowRoot.getElementById("toggle-images");
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        this.removeAttribute("block-images");
      } else {
        this.setAttribute("block-images", "");
      }
    });

    // Set initial checkbox state based on attribute
    checkbox.checked = !this.hasAttribute("block-images");
  }

  // giving user option to block all images
  static get observedAttributes() {
    return ["block-images"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "block-images") {
      const checkbox = this.shadowRoot.getElementById("toggle-images");

      if (newValue !== null) {
        this.blockImages();
        checkbox.checked = false;
      } else {
        this.unblockImages();
        checkbox.checked = true;
      }
    }
  }

  ensureHttps(img) {
    if (img.src.startsWith("http://")) {
      img.src = img.src.replace("http://", "https://");
    }
  }

  blockImages() {
    const images = this.shadowRoot.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.hasAttribute("blocked_src")) {
        img.setAttribute("blocked_src", img.src);
        img.src = "";
      }
    });
  }

  unblockImages() {
    const images = this.shadowRoot.querySelectorAll("img[blocked_src]");
    images.forEach((img) => {
      img.src = img.getAttribute("blocked_src");
      img.removeAttribute("blocked_src");
    });
  }

  parseHTMLContent() {
    const slot = this.shadowRoot.querySelector('slot[name="content"]');
    slot.addEventListener("slotchange", () => {
      this.handleSlotChange(slot);
    });
  }

  handleSlotChange(slot) {
    const nodes = slot.assignedNodes();
    if (nodes.length > 0) {
      const htmlString = nodes[0].textContent;
      this.processHTMLString(htmlString);
    }
  }

  processHTMLString(htmlString) {
    try {
      // Parse the HTML string
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");

      // Remove unwanted elements and ensure secure URLs
      this.cleanUpDocument(doc);

      // Extract and apply styles
      this.applyStyles(doc);

      // Extract and apply the content
      this.applyContent(doc);
    } catch (error) {
      console.error("Error processing HTML string:", error);
    }
  }

  cleanUpDocument(doc) {
    // Remove all script tags
    const scripts = doc.querySelectorAll("script");
    scripts.forEach((script) => script.remove());

    // Remove 1x1 pixel GIFs and ensure all images start with HTTPS
    const images = doc.querySelectorAll("img");
    images.forEach((img) => {
      if (img.width === 1 && img.height === 1 && img.src.endsWith(".gif")) {
        img.remove();
      }
      this.ensureHttps(img);
    });

    // Block images if the attribute is present
    if (this.hasAttribute("block-images")) {
      images.forEach((img) => {
        img.setAttribute("blocked_src", img.src);
        img.src = "";
      });
    }
  }

  applyStyles(doc) {
    const styles = doc.querySelectorAll("style");
    styles.forEach((style) => {
      // 3. original approach
      // this.shadowRoot.appendChild(style.cloneNode(true));
      //
      // 2. then we have this destructive way
      //    this will change the actual element directly
      // const sheet = new CSSStyleSheet();
      // sheet.replaceSync(style.textContent);
      // this.rewriteStyleSheet(sheet);
      // this.shadowRoot.adoptedStyleSheets = [
      //   ...this.shadowRoot.adoptedStyleSheets,
      //   sheet,
      // ];

      // Transform style element using CSSStyleSheet
      // finally this is what i want, way less destructive
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(style.textContent);
      this.rewriteStyleSheet(sheet);
      const newStyleContent = Array.from(sheet.cssRules)
        .map((rule) => rule.cssText)
        .join(" ");
      const newStyle = document.createElement("style");
      newStyle.textContent = newStyleContent;
      this.shadowRoot.appendChild(newStyle);
    });
  }

  applyContent(doc) {
    const content = doc.body.innerHTML;
    const contentContainer = document.createElement("div");
    contentContainer.innerHTML = content;
    this.shadowRoot.appendChild(contentContainer);
  }

  /** change body {} or html {} into :host {} to preserve the original styles */
  rewriteStyleSheet(sheet) {
    for (let rule of sheet.cssRules) {
      if (rule.selectorText) {
        rule.selectorText = rule.selectorText.replace(/body|html/g, ":host");
      }
    }
  }
}
