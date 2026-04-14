import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export interface SiteSettings {
  clinicName: string;
  logoUrl: string;
  location: string;
  mapEmbedUrl: string;
  workingHours: string;
  phone: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    whatsapp: string;
  };
  privacyPolicy: string;
  termsOfService: string;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'siteSettings', 'general');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as SiteSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching site settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { settings, loading };
}
