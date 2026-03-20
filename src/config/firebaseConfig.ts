// Helper to get env variable from Vite or Node
function getEnvVar(key: string): string | undefined {
  try {
    // Vite environment
    // @ts-ignore
    if (typeof import.meta.env !== 'undefined' && import.meta.env[key] !== undefined) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch {
    // Ignore if import.meta is not available
  }
  return undefined;
}

// This check ensures that the environment variables are loaded correctly.
if (!getEnvVar('VITE_FIREBASE_API_KEY')) {
  throw new Error("Firebase config is not set. Make sure you have a .env file in the `react-compare-app/react-compare-app` directory with the correct VITE_FIREBASE_... variables, and that you have restarted your development server.");
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID')
};

export default firebaseConfig;
