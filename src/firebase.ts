import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Only initialize Firebase in browser environment (SSR-safe)
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (typeof window !== "undefined") {
	try {
		const hasConfig = !!(firebaseConfig.apiKey && firebaseConfig.projectId);
		if (hasConfig) {
			app = getApps().length ? getApp() : initializeApp(firebaseConfig);
			auth = getAuth(app);
			db = getFirestore(app);
		}
	} catch (e) {
		console.warn("[Firebase] Initialization failed:", e);
	}
}

export { auth, db };
export const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "default-app";
export default app;
