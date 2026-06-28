import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { JSONLDMetadata } from './JSONLDMetadata';
 // wait, PSEOPage is not in types, I'll update it

export const SEOWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { slug } = useParams();
  const [seoData, setSeoData] = useState<any | null>(null);

  useEffect(() => {
    if (slug) {
      // In a real scenario, this fetches from the backend resolve endpoint
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://gpurunner-api.leonmaverik2.workers.dev/api/v1';
      fetch(`${API_BASE_URL}/seo/resolve/${slug}`)
        .then(res => {
          if (res.ok) return res.json();
          return null;
        })
        .then(data => setSeoData(data))
        .catch(err => console.error(err));
    }
  }, [slug]);

  return (
    <>
      {seoData ? (
        <JSONLDMetadata 
          type="FAQPage" 
          name={seoData.h1_title} 
          description={seoData.meta_description} 
          answerText={seoData.intro_content}
        />
      ) : (
        <JSONLDMetadata 
          type="WebPage" 
          name="GPURunner" 
          description="Optimize AI hardware memory fit and calculate API costs for local and cloud models."
        />
      )}
      {children}
    </>
  );
};
