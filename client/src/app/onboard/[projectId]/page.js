import Actions from './Actions';
import Description from './Description';
import Experiment from '../../components/Experiment/Experiment';
import styles from './page.module.css';
import getRandomConversionRate from '../../helpers/getRandomConversionRate';
import Script from 'next/script';

export default async function OnboardPage({ params, searchParams }) {
  const projectId = params.projectId;
  const authenticated = searchParams.authenticated === 'true';
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STELLAR_API}/public/onboard/${projectId}/experiments`,
    {
      cache: 'no-store',
    },
  );

  const experiments = await res.json();

  const totalEstimatedCR = experiments.reduce((acc, experiment) => {
    return (
      acc +
      getRandomConversionRate({
        seed: experiment.id,
        experimentType: experiment.type,
      })
    );
  }, 0);

  const isEmpty = experiments.length === 0;

  return (
    <div className={styles.container}>
      {isEmpty ? (
        <div className={styles.empty}>
          <h1 className={styles.title}>
            Create your account to continue setting up experiments
          </h1>
          <h3 className={styles.subTitle}>
            Seems we could not auto-generate experiments for you right now. But
            you can still create your account and start setting up experiments
            manually :)
          </h3>
        </div>
      ) : (
        <>
          <h1 className={styles.title}>
            Have you already AB tested your site's copy?
          </h1>
          <Description estimatedCR={totalEstimatedCR} />
          <div className={styles.content}>
            <div className={styles.experiments}>
              {experiments.map((experiment, i) => (
                <Experiment
                  experiment={experiment}
                  key={experiment.id}
                  onReview
                />
              ))}
            </div>
          </div>
        </>
      )}
      <Actions
        projectId={projectId}
        authenticated={authenticated}
        isEmpty={isEmpty}
      />
    </div>
  );
}
