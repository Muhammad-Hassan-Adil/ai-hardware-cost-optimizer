import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { JSONLDMetadata } from './JSONLDMetadata';
import { PSEOPage } from '../../types/database.types'; // wait, PSEOPage is not in types, I'll update it

export const SEOWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { slug } = useParams();
  const [seoData, setSeoData] = useState<any | null>(null);

  useEffect(() => {
    if (slug) {

      fetch(`http://127.0.0.1:8000/api/v1/seo/resolve/${slug}`)
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
          name="AI Hardware & Cost Optimizer Hub" 
          description="Optimize AI hardware memory fit and calculate API costs for local and cloud models."
        />
      )}
      {children}
    </>
  );
};
