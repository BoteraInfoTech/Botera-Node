import fetch from 'node-fetch';

function transformKeys(obj) {
  const result = {};
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      const newKey = '$' + key.toLowerCase().replace(/\s+/g, '_');
      result[newKey] = obj[key];
    }
  }
  return result;
}

export const sendAnonymousPosthogEvent = async (
  userEmail,
  userProperties,
  data
) => {
  const url = 'https://us.i.posthog.com/i/v0/e/';
  const headers = {
    'Content-Type': 'application/json',
  };
  const payload = {
    api_key: 'phc_r5VLPCN8IQE1IbD3oByCahaX4VaEl7qjtUuVqAJTvul',
    event: 'event name',
    distinct_id: userEmail,
    properties: {
      $set: {
        ...userProperties,
      },
      ...transformKeys(data),
    },
  };

  await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload),
  });
  return null;
};
