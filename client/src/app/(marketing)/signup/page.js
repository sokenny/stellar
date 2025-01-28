import SignUpForm from '../../components/SignUpForm';
import { quotes } from '../page';
import styles from './page.module.css';

const SignUpPage = () => {
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
        <div className={styles.colLeft}>
          <h1 className={styles.title}>Stellar Sign Up</h1>
          <SignUpForm />
        </div>
        <div className={styles.colRight} id="col-right">
          <div className={styles.testimonialsB} id="testimonialsB">
            <div
              className={styles.testimonial}
              style={{
                borderColor: quotes[0].color,
              }}
            >
              <div className={styles.testimonialHeader}>
                <div
                  className={styles.avPic}
                  style={{
                    backgroundImage: `url(https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/test1.webp)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                ></div>
                <div>
                  <p className={styles.name}>
                    <strong>Anna R. — CRO Specialist</strong>
                  </p>
                  <p>⭐️⭐️⭐️⭐️⭐️</p>
                </div>
              </div>
              <p className={styles.quote}>
                "Stellar is exactly what we needed. We switched from other
                testing tools because they were too complex and costly. With
                Stellar, we ran our first test in under 10 minutes, no developer
                required. Our conversions increased by 30% in just a few weeks.
                It’s fast, lightweight, and the support team is amazing."
              </p>
            </div>
            <div
              className={styles.testimonial}
              style={{
                borderColor: quotes[1].color,
              }}
            >
              <div className={styles.testimonialHeader}>
                <div
                  className={styles.avPic}
                  style={{
                    backgroundImage: `url(https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/test3.webp)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                ></div>
                <div>
                  <p className={styles.name}>
                    <strong>David L. — Growth Marketer</strong>
                  </p>
                  <p>⭐️⭐️⭐️⭐️⭐️</p>
                </div>
              </div>

              <p className={styles.quote}>
                "I’ve tried VWO and Optimizely, but Stellar stands out for its
                ease of use and simplicity. The script is super lightweight, and
                there’s no impact on our site speed. Setting up tests was quick,
                and the visual editor made it easy to adjust our pages without
                any coding. It’s been a game-changer for our marketing team."
              </p>
            </div>
            <div
              className={styles.testimonial}
              style={{
                borderColor: quotes[2].color,
              }}
            >
              <div className={styles.testimonialHeader}>
                <div
                  className={styles.avPic}
                  style={{
                    backgroundImage: `url(https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/test2.webp)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                ></div>
                <div>
                  <p className={styles.name}>
                    <strong>Sarah M. — E-commerce Owner</strong>
                  </p>
                  <p>⭐️⭐️⭐️⭐️⭐️</p>
                </div>
              </div>

              <p className={styles.quote}>
                "We needed a Google Optimize replacement, and Stellar exceeded
                our expectations. The tool is intuitive, and the onboarding was
                seamless. The reporting is clear, and the results helped us
                increase our sales by 20% in the first month. Highly recommend
                for anyone serious about improving their website performance."
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;
