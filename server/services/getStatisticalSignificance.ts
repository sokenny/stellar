import db from '../models';
import jStat from 'jstat';
import getExperimentStats from './getExperimentStats';

function getStatisticalSignificance(variants) {
  let results = [];

  for (let i = 0; i < variants.length; i++) {
    for (let j = i + 1; j < variants.length; j++) {
      let variantA = variants[i];
      let variantB = variants[j];

      let totalConversions = variantA.conversions + variantB.conversions;
      let totalNonConversions =
        variantA.sessions -
        variantA.conversions +
        variantB.sessions -
        variantB.conversions;
      let totalSessions = variantA.sessions + variantB.sessions;

      let expectedAConversions =
        (variantA.sessions * totalConversions) / totalSessions;
      let expectedANonConversions =
        (variantA.sessions * totalNonConversions) / totalSessions;
      let expectedBConversions =
        (variantB.sessions * totalConversions) / totalSessions;
      let expectedBNonConversions =
        (variantB.sessions * totalNonConversions) / totalSessions;

      let chiSquaredStat =
        Math.pow(variantA.conversions - expectedAConversions, 2) /
          expectedAConversions +
        Math.pow(
          variantA.sessions - variantA.conversions - expectedANonConversions,
          2,
        ) /
          expectedANonConversions +
        Math.pow(variantB.conversions - expectedBConversions, 2) /
          expectedBConversions +
        Math.pow(
          variantB.sessions - variantB.conversions - expectedBNonConversions,
          2,
        ) /
          expectedBNonConversions;

      // Degrees of freedom for a 2x2 table is 1
      let pValue = jStat.chisquare.cdf(chiSquaredStat, 1);

      results.push({
        variantAId: variantA.variantId,
        variantBId: variantB.variantId,
        chiSquaredStat,
        pValue,
      });
    }
  }

  return results;
}

async function getStatisticalSignificanceH(req, res) {
  const experimentId = req.params.id;
  console.log('id: ', experimentId);
  const variants = await getExperimentStats(experimentId);
  console.log('variants', variants);
  const statisticalSignificance = getStatisticalSignificance(variants);

  res.json(statisticalSignificance);
}

export default getStatisticalSignificanceH;
