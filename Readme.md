## `ol-html-viewer`


Simple web component to view HTML content. Example usage such as displaying an email.

## Usage

Loading and define `ol-html-viewer` web component:

```html
<!-- Critical styles to solve "Flash of Unstyled Content" or FOUC -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orchardlab/ol-html-viewer@v1.0.1/styles.css" type="text/css" />
<!-- Register ol-html-viewer -->
<script type="module">
    import { HTMLViewer } from "https://cdn.jsdelivr.net/gh/orchardlab/ol-html-viewer@v1.0.1/html-viewer.js";
    customElements.define("ol-html-viewer", HTMLViewer);
</script>
```


Using it in your HTML by passing HTML string to `<div slot="content">YOUR-ESCAPED-HTML-STRING</div>`:

```html
<ol-html-viewer>
    <div slot="content">
        &lt;h2&gt;This is a sample HTML content&lt;/h2&gt; &lt;p&gt;Here
        is a paragraph with some text.&lt;/p&gt; &lt;img
        src="https://unsplash.com/photos/hwLAI5lRhdM/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTZ8fHRva3lvfGVufDB8fHx8MTcxOTc2NDM5Nnww&force=true&w=640"
        width="500"&gt; &lt;img src="http://example.com/blocked.gif"
        width="1" height="1"&gt;
    </div>
</ol-html-viewer>
```

## Features
- Prevent styles in HTML leaking to the global
- Remove tracking pixels
- Image toggle
