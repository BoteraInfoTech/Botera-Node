import fetch from 'node-fetch';

export const getUserIPLocation = async (ip) => {
  const response = await fetch(`http://ip-api.com/json/${ip}`);
  const data = await response.json();

  return {
    country: data.country,
    region: data.regionName,
    city: data.city,
    lat: data.lat,
    lon: data.lon,
  };
};
