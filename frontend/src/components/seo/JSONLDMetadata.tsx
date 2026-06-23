import React from 'react';
import { Helmet } from 'react-helmet';

interface JSONLDMetadataProps {
  type: string;
  name: string;
  description: string;
  answerText?: string;
  url?: string;
}

export const JSONLDMetadata: React.FC<JSONLDMetadataProps> = ({ type, name, description, answerText, url }) => {
  let schema: any = {
    "@context": "https://schema.org",
    "@type": type,
    "name": name,
    "description": description,
  };

  if (url) {
    schema["url"] = url;
  }

  if (type === "FAQPage" && answerText) {
    schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [{
        "@type": "Question",
        "name": name,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": answerText
        }
      }]
    };
  }

  return (
    <Helmet>
      <title>{name}</title>
      <meta name="description" content={description} />
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
