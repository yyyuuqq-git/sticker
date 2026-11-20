import { createRoot } from 'react-dom/client';
import App from './App';
import './react-shell.css';

// The compatibility layer initialises the legacy application once. StrictMode
// intentionally remounts components in development, which would attach the
// legacy application's event listeners twice.
createRoot(document.getElementById('root')).render(<App />);
