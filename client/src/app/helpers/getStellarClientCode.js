function getStellarClientCode(apiKey, withAntiFlicker = true) {
  const antiFlickerCode = `<script>!function(){var e="body {opacity: 0 !important;}",t=document.createElement("style");t.type="text/css",t.id="page-hide-style",t.styleSheet?t.styleSheet.cssText=e:t.appendChild(document.createTextNode(e)),document.head.appendChild(t),window.rmo=function(){var e=document.getElementById("page-hide-style");e&&(e.parentNode.removeChild(e),document.body.style.opacity="")},setTimeout(window.rmo,2e3)}();</script>`;
  return `
  ${withAntiFlicker ? antiFlickerCode : ''}
  <link rel="preconnect" href="${
    process.env.NEXT_PUBLIC_STELLAR_PUBLIC_JS_HOST
  }" />
<link rel="dns-prefetch" href="${
    process.env.NEXT_PUBLIC_STELLAR_PUBLIC_JS_HOST
  }" />
<script async src="${
    process.env.NEXT_PUBLIC_STELLAR_PUBLIC_JS_HOST
  }/client_js/stellar.js?apiKey=${apiKey}"></script>`;
}

export default getStellarClientCode;
