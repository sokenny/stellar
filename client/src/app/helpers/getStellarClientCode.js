function getStellarClientCode(apiKey) {
  return `
<!-- Stellar code starts -->
<link rel="preconnect" href="${process.env.NEXT_PUBLIC_STELLAR_PUBLIC_JS_HOST}"/>
<link rel="preconnect" href="${process.env.NEXT_PUBLIC_STELLAR_PUBLIC_JS_HOST}"/>
<link rel="dns-prefetch" href="${process.env.NEXT_PUBLIC_STELLAR_PUBLIC_JS_HOST}"/>
<link rel="preload" href="${process.env.NEXT_PUBLIC_STELLAR_PUBLIC_JS_HOST}/client_js/stellar.js" as="script"/>
<script async src="${process.env.NEXT_PUBLIC_STELLAR_PUBLIC_JS_HOST}/client_js/stellar.js" data-stellar-api-key="${apiKey}"/>
<!-- Stellar code ends -->
`;
}

export default getStellarClientCode;
