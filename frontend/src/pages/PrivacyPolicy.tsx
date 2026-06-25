import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 space-y-6 text-slate-700 dark:text-slate-300"
    >
      <Link to="/" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium">
        <ArrowLeft size={18} /> Back to Hub
      </Link>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Privacy Policy</h1>
      
      <div className="space-y-4 bg-white dark:bg-slate-900/40 p-8 rounded-2xl backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-sm text-slate-500">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <p>
          At the AI Hardware & Cost Optimizer Hub, accessible from our website, one of our main priorities is the privacy of our visitors. 
          This Privacy Policy document contains types of information that is collected and recorded by us and how we use it.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">Log Files</h2>
        <p>
          We follow a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this 
          and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, 
          Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">Cookies and Web Beacons</h2>
        <p>
          Like any other website, we use 'cookies'. These cookies are used to store information including visitors' preferences, and the pages 
          on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web 
          page content based on visitors' browser type and/or other information.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">Google DoubleClick DART Cookie</h2>
        <p>
          Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based 
          upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting 
          the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" className="text-blue-500 hover:underline">https://policies.google.com/technologies/ads</a>
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">Consent</h2>
        <p>
          By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.
        </p>
      </div>
    </motion.div>
  );
};
