/**
 * Sistema de gestión de configuración de empresas
 * Permite habilitar/deshabilitar empresas para que no aparezcan en los editores
 */

const COMPANY_SETTINGS_KEY = 'speed_company_settings';

export interface CompanySettings {
  [companyId: string]: {
    enabled: boolean;
    name: string;
  };
}

/**
 * Obtiene la configuración de empresas desde localStorage
 */
export const getCompanySettings = (): CompanySettings => {
  try {
    const stored = localStorage.getItem(COMPANY_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error al cargar configuración de empresas:', error);
  }
  return {};
};

/**
 * Guarda la configuración de empresas en localStorage
 */
export const saveCompanySettings = (settings: CompanySettings): void => {
  try {
    localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error al guardar configuración de empresas:', error);
  }
};

/**
 * Habilita o deshabilita una empresa
 */
export const toggleCompanyEnabled = (companyId: string, companyName: string, enabled: boolean): void => {
  const settings = getCompanySettings();
  settings[companyId] = {
    enabled,
    name: companyName
  };
  saveCompanySettings(settings);
};

/**
 * Verifica si una empresa está habilitada
 * Por defecto, todas las empresas están habilitadas
 */
export const isCompanyEnabled = (companyId: string): boolean => {
  const settings = getCompanySettings();
  // Si no existe configuración para esta empresa, está habilitada por defecto
  if (!settings[companyId]) {
    return true;
  }
  return settings[companyId].enabled;
};

/**
 * Inicializa la configuración de una empresa si no existe
 */
export const initializeCompanySetting = (companyId: string, companyName: string): void => {
  const settings = getCompanySettings();
  if (!settings[companyId]) {
    settings[companyId] = {
      enabled: true,
      name: companyName
    };
    saveCompanySettings(settings);
  }
};

/**
 * Obtiene todas las empresas habilitadas
 */
export const getEnabledCompanies = (): string[] => {
  const settings = getCompanySettings();
  return Object.keys(settings).filter(id => settings[id].enabled);
};

/**
 * Filtra una lista de empresas para mostrar solo las habilitadas
 */
export const filterEnabledCompanies = <T extends { id: string | number; name?: string; nombre?: string }>(
  companies: T[]
): T[] => {
  return companies.filter(company => {
    const companyId = String(company.id);
    return isCompanyEnabled(companyId);
  });
};
