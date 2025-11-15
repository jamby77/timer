/**
 * Format seconds to MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format milliseconds to MM:SS format
 */
export const formatTimeMs = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  return formatTime(totalSeconds);
};

export const parseTimeToMs = (timeString: string): number => {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return (minutes * 60 + seconds) * 1000;
};
