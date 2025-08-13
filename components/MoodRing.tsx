"use client";

import { useState, useRef, useEffect } from "react";

interface MoodRingProps {
  onMoodSelect: (mood: string) => void;
  disabled?: boolean;
}

const moods = [
  { name: "Joyful", color: "#FFD700", angle: 0 },
  { name: "Peaceful", color: "#87CEEB", angle: 30 },
  { name: "Hopeful", color: "#98FB98", angle: 60 },
  { name: "Grateful", color: "#FFA07A", angle: 90 },
  { name: "Loving", color: "#FFB6C1", angle: 120 },
  { name: "Anxious", color: "#DDA0DD", angle: 150 },
  { name: "Sad", color: "#778899", angle: 180 },
  { name: "Angry", color: "#CD5C5C", angle: 210 },
  { name: "Confused", color: "#BC8F8F", angle: 240 },
  { name: "Lonely", color: "#696969", angle: 270 },
  { name: "Overwhelmed", color: "#2F4F4F", angle: 300 },
  { name: "Seeking", color: "#8A2BE2", angle: 330 }
];

export default function MoodRing({ onMoodSelect, disabled = false }: MoodRingProps) {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawMoodRing();
  }, [hoveredMood, selectedMood]);

  const drawMoodRing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 120;
    const segmentAngle = (2 * Math.PI) / moods.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moods.forEach((mood, index) => {
      const startAngle = (index * segmentAngle) - Math.PI / 2;
      const endAngle = ((index + 1) * segmentAngle) - Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      const isHovered = hoveredMood === mood.name;
      const isSelected = selectedMood === mood.name;
      
      if (isSelected) {
        ctx.fillStyle = mood.color;
        ctx.shadowColor = mood.color;
        ctx.shadowBlur = 20;
      } else if (isHovered) {
        ctx.fillStyle = mood.color;
        ctx.shadowColor = mood.color;
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = mood.color;
        ctx.shadowBlur = 0;
      }

      ctx.fill();

      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.shadowBlur = 0;

      const textAngle = startAngle + segmentAngle / 2;
      const textRadius = radius * 0.7;
      const textX = centerX + Math.cos(textAngle) * textRadius;
      const textY = centerY + Math.sin(textAngle) * textRadius;

      ctx.fillStyle = 'white';
      ctx.font = isHovered || isSelected ? 'bold 14px Arial' : '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(mood.name, textX, textY);
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= 120) {
      let angle = Math.atan2(dy, dx) + Math.PI / 2;
      if (angle < 0) angle += 2 * Math.PI;

      const segmentAngle = (2 * Math.PI) / moods.length;
      const segmentIndex = Math.floor(angle / segmentAngle);
      const mood = moods[segmentIndex];

      if (mood) {
        setSelectedMood(mood.name);
        onMoodSelect(mood.name);
      }
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= 120) {
      let angle = Math.atan2(dy, dx) + Math.PI / 2;
      if (angle < 0) angle += 2 * Math.PI;

      const segmentAngle = (2 * Math.PI) / moods.length;
      const segmentIndex = Math.floor(angle / segmentAngle);
      const mood = moods[segmentIndex];

      setHoveredMood(mood ? mood.name : null);
      canvas.style.cursor = 'pointer';
    } else {
      setHoveredMood(null);
      canvas.style.cursor = 'default';
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoveredMood(null);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        style={{ 
          border: '2px solid white', 
          borderRadius: '50%',
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'default'
        }}
      />
      {hoveredMood && !disabled && (
        <p style={{ 
          color: 'white', 
          marginTop: '1rem', 
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          {hoveredMood}
        </p>
      )}
    </div>
  );
}