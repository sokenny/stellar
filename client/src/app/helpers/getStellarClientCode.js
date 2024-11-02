function getStellarClientCode(apiKey, withAntiFlicker = true) {
  const antiFlickerCode = `<script>
  var timeout = 3000;
  (function(d, w, t, id) {
    var s = d.createElement("style");
    s.id = id;
    s.textContent = "body{opacity:0}";
    d.head.appendChild(s);
    
    w.rmo = function() {
      if (s) s.parentNode.removeChild(s);
    };
    setTimeout(w.rmo, t);
  })(document, window, timeout, "abhide");
</script>`;
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
