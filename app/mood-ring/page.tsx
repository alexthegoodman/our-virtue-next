"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MoodRing from "@/components/MoodRing";

export default function MoodRingPage() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    setIsLoading(true);

    try {
      const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
      
      const response = await fetch('/api/match-poem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-selected-language': selectedLanguage,
        },
        body: JSON.stringify({ mood }),
      });

      if (response.ok) {
        const { poemPath } = await response.json();
        const finalPath = selectedLanguage === 'en' ? poemPath : `/${selectedLanguage}${poemPath}`;
        router.push(finalPath);
      } else {
        console.error('Failed to match poem');
      }
    } catch (error) {
      console.error('Error matching poem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <h1 style={{ 
        color: 'white', 
        marginBottom: '2rem', 
        textAlign: 'center',
        fontSize: '2.5rem',
        fontWeight: '300'
      }}>
        How are you feeling?
      </h1>
      
      <MoodRing onMoodSelect={handleMoodSelect} disabled={isLoading} />
      
      {isLoading && (
        <p style={{ 
          color: 'white', 
          marginTop: '2rem',
          fontSize: '1.2rem'
        }}>
          Finding the perfect poem for you...
        </p>
      )}
    </div>
  );
}