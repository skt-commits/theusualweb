'use client';
import { useEffect } from 'react';

export default function CleanUrl() {
  useEffect(() => {
    // Check if the parameter exists
    if (typeof window !== 'undefined' && window.location.search.includes('srsltid=')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('srsltid');
      
      // Update the URL in the browser without refreshing the page
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);

  return null;
}
