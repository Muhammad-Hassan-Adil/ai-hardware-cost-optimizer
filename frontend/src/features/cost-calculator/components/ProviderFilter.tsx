import React, { useEffect, useState } from 'react';
import { Dropdown } from '../../../components/common/Dropdown';
import { supabase } from '../../../services/supabaseClient';

interface ProviderFilterProps {
  providerFilter: string;
  setProviderFilter: (v: string) => void;
}

export const ProviderFilter: React.FC<ProviderFilterProps> = ({ providerFilter, setProviderFilter }) => {
  const [providers, setProviders] = useState<{label: string, value: string}[]>([
    { label: "All Providers", value: "all" }
  ]);

  useEffect(() => {
    const fetchProviders = async () => {
      const { data } = await supabase.from('cloud_providers').select('name, slug');
      if (data) {
        const formatted = data.map(p => ({ label: p.name, value: p.slug }));
        setProviders([{ label: "All Providers", value: "all" }, ...formatted]);
      }
    };
    fetchProviders();
  }, []);

  return (
    <div className="w-64">
      <Dropdown
        options={providers}
        value={providerFilter}
        onChange={setProviderFilter}
        placeholder="Select Provider..."
      />
    </div>
  );
};
