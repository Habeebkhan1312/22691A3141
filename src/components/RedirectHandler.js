import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUrlByShortCode, recordClick } from '../services/urlService';
import logging from '../utils/logging';

const RedirectHandler = () => {
  const { shortCode } = useParams();

  useEffect(() => {
    const handleRedirect = async () => {
      logging(`Handling redirect for shortcode: ${shortCode}`);
      try {
        const url = await getUrlByShortCode(shortCode);
        if (url) {
          await recordClick(shortCode);
          logging(`Redirecting to: ${url.longUrl}`);
          window.location.href = url.longUrl;
        } else {
          logging(`Shortcode not found: ${shortCode}`, 'error');
          // Handle not found case, maybe redirect to a 404 page
        }
      } catch (error) {
        logging(`Error handling redirect: ${error.message}`, 'error');
      }
    };

    if (shortCode) {
      handleRedirect();
    }
  }, [shortCode]);

  return null;
};

export default RedirectHandler;
