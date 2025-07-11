import logging from '../utils/logging';

const getUrlsFromStorage = () => {
  const urls = localStorage.getItem('urls');
  return urls ? JSON.parse(urls) : [];
};

const saveUrlsToStorage = (urls) => {
  localStorage.setItem('urls', JSON.stringify(urls));
};

const generateShortCode = () => {
  return Math.random().toString(36).substring(2, 8);
};

export const addUrl = async (urlData) => {
  logging(`Adding URL: ${urlData.longUrl}`);
  const urls = getUrlsFromStorage();
  const { longUrl, validity, shortCode } = urlData;

  if (shortCode && urls.some(url => url.shortCode === shortCode)) {
    throw new Error('Custom shortcode already exists.');
  }

  const newShortCode = shortCode || generateShortCode();
  const creationDate = new Date();
  const expiryDate = new Date(creationDate.getTime() + (validity || 30) * 60000);

  const newUrl = {
    longUrl,
    shortCode: newShortCode,
    shortUrl: `${window.location.origin}/${newShortCode}`,
    creationDate: creationDate.toISOString(),
    expiryDate: expiryDate.toISOString(),
    clicks: [],
  };

  saveUrlsToStorage([...urls, newUrl]);
  logging(`URL added successfully with shortcode: ${newShortCode}`);
  return newUrl;
};

export const getUrls = async () => {
  logging('Fetching all URLs');
  return getUrlsFromStorage();
};

export const getUrlByShortCode = async (shortCode) => {
  logging(`Fetching URL by shortcode: ${shortCode}`);
  const urls = getUrlsFromStorage();
  return urls.find(url => url.shortCode === shortCode);
};

export const recordClick = async (shortCode) => {
  logging(`Recording click for shortcode: ${shortCode}`);
  let urls = getUrlsFromStorage();
  const urlIndex = urls.findIndex(url => url.shortCode === shortCode);

  if (urlIndex !== -1) {
    const click = {
      timestamp: new Date().toISOString(),
      source: document.referrer || 'Direct',
      location: 'Unknown', // In a real app, this would be determined via IP lookup
    };
    urls[urlIndex].clicks.push(click);
    saveUrlsToStorage(urls);
    logging('Click recorded successfully');
  } else {
    logging(`Shortcode not found for recording click: ${shortCode}`, 'error');
  }
};
