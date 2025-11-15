/**
 * Format time (seconds or milliseconds) to MM:SS.MS format (with 2-digit milliseconds)
 */
export const formatTime = (time: number): string => {
  const totalSeconds = Math.floor(time / 1000);
  const milliseconds = Math.round((time % 1000) / 10); // Convert to 2-digit (0-99)
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
};

/**
 * Format milliseconds to MM:SS.MS format (with 2-digit milliseconds)
 */
export const formatTimeMs = (ms: number): string => {
  return formatTime(ms);
};

export const parseTimeToMs = (timeString: string): number => {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return (minutes * 60 + seconds) * 1000;
};
