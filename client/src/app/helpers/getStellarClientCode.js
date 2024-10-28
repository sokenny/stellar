function getStellarClientCode(apiKey) {
  return `
<!-- Stellar code starts -->
<script>
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    stellarApiKey: '${apiKey}',
  });
</script>
<link rel="preconnect" href="${process.env.NEXT_PUBLIC_STELLAR_PUBLIC_JS_HOST}"/>
<link rel="dns-prefetch" href="${process.env.NEXT_PUBLIC_STELLAR_PUBLIC_JS_HOST}"/>
<script async src="${process.env.NEXT_PUBLIC_STELLAR_PUBLIC_JS_HOST}/client_js/stellar.js"/>
<!-- Stellar code ends -->
`;
}

export default getStellarClientCode;
