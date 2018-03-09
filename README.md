rwd-preview
===============

(not working.  these are just requirements)

Most responsive web design (RWD) preview tools have problems that make them difficult to use.  This one is an attempt to make it easy to develop:

1) The preview page shows ALL the breakpoints for that URL in multiple iframes.

2) When navigating inside one of the ifrmaes, all other iframes will change to that same page.

3) The breakpoint min and max dimensions can be toggled.

This problem is tricky because the same origin is required for the preview app and the iframed URL.  A proxy is used for the domain that is being previewed so it looks like they are all coming from the same site.

## Hosted

There is a hosted version at http://tbd/

## Build the app

```
$ npm install
```

## Running the app

```
$ npm start
```

## Usage
```
HTTP site:
http://localhost:5000/preview/      (defaults to previewing http://localhost:8080/)
http://localhost:5000/preview/?url=[yourUrl]

HTTPS site:
https://localhost:5000/preview/?url=[yourUrl]
```

## Help! My site doesn't show up at all!

The preview page uses iframes and thus suffers from issues around iframing and cross-origin.

If this error appears:

    'Refused to display 'http://localhost:8080/site/home' in a frame because it set 'x-frame-options' to 'SAMEORIGIN'.'

This means the URL you want to display has `x-frame-options` set to 'SAMEORIGIN' by default.  There are two ways to solve this:

**1) If you have access to change the response headers of the URL:**
Remove the `x-frame-options` header from the response
OR
Set the `x-frame-options` to any dummy value (e.g. 'anyDummyValueAllowsAppToBeIframed') which causes the browser to ignore it.

**2) If you cannot change the response headers:**
You'll need to go off the deep end here... If you're serious about this, use a proxy tool like BurpSuite to remove the response header 'x-frame-options' from all incoming requests to the browser.
