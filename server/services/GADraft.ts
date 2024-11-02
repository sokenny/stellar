// const { google } = require('googleapis');
// const analytics = google.analytics('v3');

// async function listGoals(auth) {
//   const analytics = google.analytics({
//     version: 'v3',
//     auth: auth,
//   });

//   const res = await analytics.management.goals.list({
//     accountId: 'YOUR_ACCOUNT_ID',
//     webPropertyId: 'YOUR_PROPERTY_ID',
//     profileId: 'YOUR_VIEW_ID',
//   });

//   const goals = res.data.items;
//   if (goals.length) {
//     console.log('Goals:');
//     goals.forEach((goal) => {
//       console.log(`${goal.id}: ${goal.name}`);
//     });
//   } else {
//     console.log('No goals found.');
//   }
// }
