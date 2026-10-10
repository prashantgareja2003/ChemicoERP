import { createContext, useContext } from 'react';

export const ErpContext = createContext(null);

export function useErp() {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
}

export default useErp;
