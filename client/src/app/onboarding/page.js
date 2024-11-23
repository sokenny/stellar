import OnboardingForm from '../components/OnboardingForm';
import styles from './page.module.css';

export default function OnboardStartPage({ params, searchParams }) {
  return (
    <>
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
!function(){var e="body {opacity: 0 !important;}",t=document.createElement("style");t.type="text/css",t.id="page-hide-style",t.styleSheet?t.styleSheet.cssText=e:t.appendChild(document.createTextNode(e)),document.head.appendChild(t),window.rmo=function(){var e=document.getElementById("page-hide-style");e&&(e.parentNode.removeChild(e),document.body.style.opacity="")},setTimeout(window.rmo,2e3)}();
            `,
        }}
      />
      <link rel="preconnect" href="https://d3niuqph2rteir.cloudfront.net" />
      <link rel="dns-prefetch" href="https://d3niuqph2rteir.cloudfront.net" />
      <script
        async
        src="https://d3niuqph2rteir.cloudfront.net/client_js/stellar.js?apiKey=0731c4ad35896011b5a57edd84c2a6da:2ed5c336eaab747c6cb462aa39840a6db9b5abc7dfc750b89103abacb98873f4"
      ></script>
      <div className={styles.container}>
        <OnboardingForm />
      </div>
    </>
  );
}
