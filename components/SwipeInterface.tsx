'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Stanza {
  slug: string;
  text: string;
}

interface Poem {
  title: string;
  stanzas: Stanza[];
}

interface StanzaData {
  [category: string]: {
    [poemSlug: string]: Poem;
  };
}

interface SwipeInterfaceProps {
  data: StanzaData;
}

export default function SwipeInterface({ data }: SwipeInterfaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Flatten data for easier random access
  const allPoems = useRef<{ category: string; slug: string; poem: Poem }[]>([]);
  
  // Initialize flattened data
  if (allPoems.current.length === 0) {
    Object.entries(data).forEach(([category, poems]) => {
      Object.entries(poems).forEach(([slug, poem]) => {
        allPoems.current.push({ category, slug, poem });
      });
    });
  }

  const [currentPoemIndex, setCurrentPoemIndex] = useState<number>(-1);
  const [currentStanzaIndex, setCurrentStanzaIndex] = useState<number>(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  // Initialize from URL or random
  useEffect(() => {
    const poemSlug = searchParams.get('poem');
    const stanzaIdx = parseInt(searchParams.get('stanza') || '0', 10);

    if (poemSlug) {
      const foundIndex = allPoems.current.findIndex(p => p.slug === poemSlug);
      if (foundIndex !== -1) {
        setCurrentPoemIndex(foundIndex);
        setCurrentStanzaIndex(stanzaIdx);
        return;
      }
    }
    
    // If no URL param or not found, pick random
    pickRandomPoem();
  }, []);

  const updateUrl = (poemIdx: number, stanzaIdx: number) => {
    const p = allPoems.current[poemIdx];
    if (p) {
      router.push(`/?poem=${p.slug}&stanza=${stanzaIdx}`, { scroll: false });
    }
  };

  const pickRandomPoem = () => {
    const randomIndex = Math.floor(Math.random() * allPoems.current.length);
    setCurrentPoemIndex(randomIndex);
    setCurrentStanzaIndex(0);
    updateUrl(randomIndex, 0);
  };

  const recordSwipe = async (poemSlug: string, stanzaSlug: string, direction: 'left' | 'right') => {
    try {
      await fetch('/api/swipe-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poemSlug,
          stanzaSlug,
          direction,
        }),
      });
    } catch (error) {
      console.error('Failed to record swipe:', error);
    }
  };

  const handleSwipeLeft = () => {
    const currentPoem = allPoems.current[currentPoemIndex];
    if (currentPoem) {
       const currentStanza = currentPoem.poem.stanzas[currentStanzaIndex];
       recordSwipe(currentPoem.slug, currentStanza.slug, 'left');
    }

    // New Poem
    setDirection('left');
    setTimeout(() => {
      pickRandomPoem();
      setDirection(null);
    }, 300); // Wait for animation
  };

  const handleSwipeRight = () => {
    const currentPoem = allPoems.current[currentPoemIndex];
    if (currentPoem) {
        const currentStanza = currentPoem.poem.stanzas[currentStanzaIndex];
        recordSwipe(currentPoem.slug, currentStanza.slug, 'right');
    }

    // Next Stanza
    setDirection('right');
    setTimeout(() => {
      const currentPoem = allPoems.current[currentPoemIndex];
      if (currentPoem && currentStanzaIndex < currentPoem.poem.stanzas.length - 1) {
        const nextStanza = currentStanzaIndex + 1;
        setCurrentStanzaIndex(nextStanza);
        updateUrl(currentPoemIndex, nextStanza);
      } else {
        // End of poem, maybe go to next poem?
        // User said: "If they swipe right, they continue reading that poem and get the next stanza."
        // Implied: If no next stanza, what? I'll assume new poem for now to keep flow.
        pickRandomPoem();
      }
      setDirection(null);
    }, 300);
  };

  // Touch handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleSwipeLeft();
    } else if (isRightSwipe) {
      handleSwipeRight();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Mouse handling for desktop testing
  const onMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
  };
  
  const onMouseUp = (e: React.MouseEvent) => {
    if (!touchStartX.current) return;
    touchEndX.current = e.clientX;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleSwipeLeft();
    } else if (isRightSwipe) {
      handleSwipeRight();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };


  if (currentPoemIndex === -1) return <div>Loading...</div>;

  const currentPoemData = allPoems.current[currentPoemIndex];
  const currentStanza = currentPoemData.poem.stanzas[currentStanzaIndex];

  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80%', 
        minHeight: "66vh",
        backgroundColor: '#f5f5f5',
        fontFamily: 'serif',
        maxWidth: "550px",
        padding: "20px",
        margin: "0 auto"
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <div 
        style={{
          width: '90%',
          maxWidth: '450px',
          height: '80%',
          minHeight: "40vh",
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          transform: direction === 'left' ? 'translateX(-100vw) rotate(-20deg)' : 
                     direction === 'right' ? 'translateX(100vw) rotate(20deg)' : 'translateX(0) rotate(0deg)',
          opacity: direction ? 0 : 1,
          userSelect: 'none'
        }}
      >
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#333' }}>
          {currentPoemData.poem.title}
        </h2>
        <div style={{ fontSize: '1.2rem', lineHeight: '1.6', color: '#555', whiteSpace: 'pre-line' }}>
          {currentStanza.text}
        </div>
        <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: '#999' }}>
          {currentStanzaIndex + 1} / {currentPoemData.poem.stanzas.length}
        </div>
      </div>
      
      <div style={{ position: 'absolute', bottom: '20px', display: 'flex', gap: '20px' }}>
        <button onClick={handleSwipeLeft} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', background: '#ff6b6b', color: 'white', fontWeight: 'bold' }}>
           Later (New Poem)
        </button>
        <button onClick={handleSwipeRight} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', background: '#4ecdc4', color: 'white', fontWeight: 'bold' }}>
           Continue (Next Stanza)
        </button>
      </div>
    </div>
  );
}
