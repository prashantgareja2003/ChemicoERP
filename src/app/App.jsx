import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { ErpProvider } from './providers';

export function App() {
  return (
    <ErpProvider>
      <RouterProvider router={router} />
    </ErpProvider>
  );
}

export default App;
