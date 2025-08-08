# DOCTYPE

`DOCTYPE` is short for "document type" and is used in web design to indicate the version of XHTML or HTML being used. 

`HTML5` does not rely on `SGML`, so it does not require a reference to a `DTD`.

The `<!DOCTYPE html>` declaration must be the first line of an HTML document and should be placed before the `<html>` tag.

```xml
<!DOCTYPE html>
<html>
    <head>
        <title></title>
    </head>
    <body>

    </body>
</html>
```

In HTML 4.01, the `<!DOCTYPE>` declaration references a `DTD` because HTML 4.01 is based on `SGML`. The `DTD` specifies the rules of the markup language so that browsers can correctly render the content.

```
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">
```

The `DTD` in the above example is called a Document Type Definition, which contains the rules for the document. The browser interprets the markup of your page based on the defined `DTD` and displays it accordingly.

To create a standards-compliant webpage, the `DOCTYPE` declaration is an essential component. Without a correct `DOCTYPE` for your XHTML, neither the markup nor the CSS will be effective.

## XHTML 1.0 provides three options for DTD declarations:

1. Transitional: This requires a very loose `DTD` and allows the continued use of HTML 4.01 markup (but in the syntax of XHTML). The complete code is as follows:

```
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
```

2. Strict: This requires a strict `DTD` and does not allow the use of any presentational markup or attributes, such as `<br>`. The complete code is as follows:

```
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
```

3. Frameset: This is specifically designed for pages that use frames. If your page contains frames, you should use this `DTD`. The complete code is as follows:

```
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```