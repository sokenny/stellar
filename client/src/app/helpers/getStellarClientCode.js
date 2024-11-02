function getStellarClientCode(apiKey) {
  return `<link rel="preconnect" href="${process.env.NEXT_PUBLIC_STELLAR_PUBLIC_JS_HOST}" />
<link rel="dns-prefetch" href="${process.env.NEXT_PUBLIC_STELLAR_PUBLIC_JS_HOST}" />
<script async src="${process.env.NEXT_PUBLIC_STELLAR_PUBLIC_JS_HOST}/client_js/stellar.js?apiKey=${apiKey}"></script>`;
}

export default getStellarClientCode;
