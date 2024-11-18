# HTML Semantics

Semantics can be summarized as selecting tags based on content and using the most appropriate tags to mark the content. For example, the title of a webpage should use `<h1>~<h6>` tags instead of `<div>+css`.

## Benefits of Semantics
* Semantic HTML makes the structure clear, which is beneficial for code maintenance and adding styles.
* Semantic HTML usually results in less code, leading to faster page loading.
* Even without CSS styles, the content and code structure can be presented well.
* Facilitates team development and maintenance, as semantic HTML is more readable and follows W3C standards, reducing inconsistencies.
* Enables other devices to parse and render web pages in a meaningful way, such as screen readers, braille readers, and mobile devices.
* Improves search engine optimization (SEO) by establishing good communication with search engines. This helps search engine crawlers to gather more relevant information, as crawlers rely on tags to determine context and keyword importance.

## Tips for Writing Semantic HTML
* Minimize the use of non-semantic tags like `<div>` and `<span>`.
* Avoid using purely presentational tags. For example, `<b>` is a purely presentational tag, while `<strong>` has the semantic meaning of bold.
* Use the `for` attribute in `<label>` tags to associate explanatory text with corresponding `<input>` elements.
* Wrap form fields with `<fieldset>` tags and use `<legend>` tags to describe the purpose of the form.
* Use `<strong>` or `<em>` tags to emphasize text. `<strong>` has the default style of bold, while `<em>` represents italic.
* When using tables, use `<caption>` for the title, `<thead>` for the table header, `<tbody>` to enclose the main content, and `<tfoot>` to enclose the footer. Differentiate between table headers and regular cells by using `<th>` for headers and `<td>` for cells.

## Commonly Used Semantic Tags

Translate into English:

* `<h1>~<h6>` defines the title of the page, with `<h1>` being the highest level and `<h6>` being the lowest level.
* `<header>` typically includes the website logo, main navigation, site-wide links, and search box.
* `<nav>` provides navigation links within the current document or to other documents, common examples of navigation sections are menus, directories, and indexes.
* `<main>` consists of the main content area that is directly related to the central theme of the document or the central functionality of the application.
* `<article>` focuses on a single topic, such as a blog post, newspaper article, or web page article.
* `<address>` provides contact information for one or more individuals or organizations.
* `<section>` defines a section in the document, representing a standalone part of the HTML document.
* `<aside>` represents a portion of the document that is indirectly related to the main content of the document, often displayed as a sidebar.
* `<footer>` defines the bottom area of the document, typically containing information such as the author, copyright information, contact details, etc.
* `<hgroup>` represents a group of heading elements `<h1>~<h6>` that are grouped together for a section of the document.
* `<ul>` represents an unordered list of items, typically displayed as a bullet point list.
* `<ol>` represents an ordered list of items, typically displayed as a numbered list.
* `<li>` represents an item in a list.
* `<strong>` represents content that is of strong importance or emphasis, typically displayed in bold by browsers.
* `<em>` marks text that is emphasized, can be nested with `<em>` elements, with each nested level indicating a higher level of emphasis.
* `<small>` represents side comments and small print, such as copyright and legal text, independent of its styling.
* `<abbr>` represents an abbreviation or acronym.
* `<cite>` is used to describe a citation to a creative work, and must include the title of that work.
* `<figure>` represents independent content that may have an optional caption specified using the `<figcaption>` element.
* `<figcaption>` represents a caption or legend for the rest of the content within its parent `<figure>` element.
* `<blockquote>` defines a block quotation, can use the `<cite>` element to provide a textual representation.
* `<mark>` represents text that is marked or highlighted for reference or annotation purposes.
* `<time>` represents a specific time.
* `<date>` represents a specific date.
* `<dfn>` is used to represent a term defined in the context of a phrase or sentence.
* `<code>` styles the content of a short snippet of computer code to display its content.
* `<samp>` represents output from a program or a quote from inline text or sample text.
* `<kbd>` represents text that is typed from a keyboard, often used in computer-related documents or manuals.
* `<del>` represents a range of text that has been deleted from the document.
* `<ins>` represents a range of text that has been added to the document.
* `<menu>` represents a set of commands that the user can perform or activate, such as a context menu.
* `<dialog>` represents a dialog box or other interactive component, such as a inspector or subwindow.
* `<summary>` specifies a summary, heading, or legend for the `<details>` element's disclosure box.
* `<details>` describes details about a document or part of a document.
* `<bdi>`: allows setting a span of text that is isolated from its parent element's text direction setting.
* `<progress>`: defines the progress of any type of task, only for tasks with known maximum and minimum values.

## Deprecated HTML Elements

> These are old HTML elements that have been deprecated and should not be used anymore.  
> Do not use them in new projects and replace them in old projects as soon as possible, even if they can still be used.

`<acronym>`, `<applet>`, `<basefont>`, `<bgsound>`, `<big>`, `<blink>`, `<center>`, `<command>`, `<content>`, `<dir>`, `<element>`, `<font>`, `<frame>`, `<frameset>`, `<image>`, `<isindex>`, `<keygen>`, `<listing>`, `<marquee>`, `<menuitem>`, `<multicol>`, `<nextid>`, `<nobr>`, `<noembed>`, `<noframes>`, `<plaintext>`, `<shadow>`, `<spacer>`, `<strike>`, `<tt>`, `<xmp>`.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```