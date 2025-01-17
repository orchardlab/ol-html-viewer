import test from "ava";
import { fireEvent, waitFor } from "@testing-library/dom";
import { HTMLViewer } from "../html-viewer.js";

customElements.define("html-viewer", HTMLViewer);

test.beforeEach((t) => {
  document.body.innerHTML = `
    <html-viewer>
      <div slot="content">
        &lt;p&gt;Hello World&lt;/p&gt;
        &lt;img src="http://example.com/image.jpg" width="100" height="100"&gt;
        &lt;img src="http://example.com/blocked.gif" width="1" height="1"&gt;
      </div>
    </html-viewer>
  `;

  t.context.element = document.querySelector("html-viewer");
});

test("should render the content in the shadow DOM", async (t) => {
  const content = t.context.element.shadowRoot;
  t.truthy(content);
  t.regex(content.innerHTML, /Hello World/);
});

test("should remove 1x1 pixel GIFs", (t) => {
  const img = t.context.element.shadowRoot.querySelector(
    'img[src="http://example.com/blocked.gif"]',
  );
  t.falsy(img);
});

test("should ensure images are loaded over HTTPS", (t) => {
  const img = t.context.element.shadowRoot.querySelector(
    "img:not([blocked_src])",
  );
  t.is(img.src, "https://example.com/image.jpg");
});

test("should block images when block-images attribute is present", (t) => {
  t.context.element.setAttribute("block-images", "");
  const img = t.context.element.shadowRoot.querySelector("img[blocked_src]");
  t.is(img.getAttribute("src"), "");
});

test("should toggle images on checkbox change", (t) => {
  const checkbox = t.context.element.shadowRoot.getElementById("toggle-images");
  checkbox.checked = true;
  fireEvent.change(checkbox);

  t.false(t.context.element.hasAttribute("block-images"));

  checkbox.checked = false;
  fireEvent.change(checkbox);

  t.true(t.context.element.hasAttribute("block-images"));
});

test("should render content when htmlString property is set", async (t) => {
  const viewer = document.createElement("html-viewer");
  document.body.appendChild(viewer);

  viewer.htmlString =
    "<h1>Test Header</h1><p>Test Paragraph</p><img src='http://example.com/test.jpg'>";

  // Wait for the component to process the HTML string
  await waitFor(() => {
    const content = viewer.shadowRoot.querySelector("div");
    return content && content.innerHTML.includes("Test Header");
  });

  const content = viewer.shadowRoot;

  t.truthy(content);
  t.regex(content.innerHTML, /Test Header/);
  t.regex(content.innerHTML, /Test Paragraph/);

  const img = content.querySelector("img");
  t.truthy(img);
  t.is(img.src, "https://example.com/test.jpg");

  document.body.removeChild(viewer);
});
