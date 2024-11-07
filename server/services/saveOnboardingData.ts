import db from '../models';

async function saveOnboardingData(data, userId) {
  try {
    const onboardingAnswer = await db.OnboardingAnswer.create({
      user_id: userId,
      industry: data.industry,
      company_size: data.companySize,
      discovery_method: data.discoveryMethod,
      monthly_traffic: data.monthlyTraffic,
    });
    return onboardingAnswer;
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    throw new Error('Could not save onboarding data');
  }
}

export default saveOnboardingData;
