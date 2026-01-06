import React from 'react';
import Select from 'react-select';

interface Location {
  id: string;
  name: string;
  region?: string;
  direccion?: string;
  coordinates?: [number, number];
  address?: string;
}

interface Option {
  value: string;
  label: string;
  region?: string;
  direccion?: string;
}

interface LocationSelectProps {
  value: string[];
  onChange: (values: string[]) => void;
  locations: Location[];
  disabled?: boolean;
  isMulti?: boolean;
  className?: string;
}

export const LocationSelect: React.FC<LocationSelectProps> = ({
  value,
  onChange,
  locations,
  disabled = false,
  isMulti = false,
  className
}) => {
  const options: Option[] = locations.map(l => ({
    value: l.id,
    label: l.name,
    region: l.region,
    direccion: l.direccion
  }));

  const formatOptionLabel = ({ label, region, direccion }: Option) => (
    <div className="flex flex-col py-1">
      <div className="font-medium">{label}</div>
      {region && <div className="text-sm text-gray-500">{region}</div>}
      {direccion && <div className="text-sm text-gray-600 mt-0.5">{direccion}</div>}
    </div>
  );

  const handleChange = (selectedOptions: any) => {
    if (!selectedOptions) {
      onChange([]);
      return;
    }

    if (Array.isArray(selectedOptions)) {
      onChange(selectedOptions.map(option => option.value));
    } else {
      onChange([selectedOptions.value]);
    }
  };

  const selectedValues = options.filter(option => 
    value.includes(option.value)
  );

  return (
    <Select
      isMulti={isMulti}
      isDisabled={disabled}
      value={selectedValues}
      onChange={handleChange}
      options={options}
      formatOptionLabel={formatOptionLabel}
      classNames={{
        control: (state) => `${className} ${state.isFocused ? 'border-indigo-500' : ''}`,
        menu: () => "bg-white rounded-lg shadow-lg max-h-60 overflow-auto",
        option: () => "px-3 py-2 hover:bg-gray-100 cursor-pointer"
      }}
      placeholder="Seleccionar sucursales..."
      closeMenuOnSelect={!isMulti}
      isClearable
    />
  );
}; 