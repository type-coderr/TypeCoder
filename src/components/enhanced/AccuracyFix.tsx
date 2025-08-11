import { useState, useEffect } from 'react';

interface AccuracyCalculatorProps {
  userInput: string;
  targetText: string;
  onAccuracyUpdate: (accuracy: number) => void;
}

const AccuracyCalculator = ({ userInput, targetText, onAccuracyUpdate }: AccuracyCalculatorProps) => {
  const [currentAccuracy, setCurrentAccuracy] = useState(100);

  useEffect(() => {
    if (userInput.length === 0) {
      setCurrentAccuracy(100);
      onAccuracyUpdate(100);
      return;
    }

    let correctChars = 0;
    let totalChars = userInput.length;

    // Compare each character
    for (let i = 0; i < userInput.length; i++) {
      if (i < targetText.length && userInput[i] === targetText[i]) {
        correctChars++;
      }
    }

    // Calculate accuracy as percentage
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    
    setCurrentAccuracy(accuracy);
    onAccuracyUpdate(accuracy);
  }, [userInput, targetText, onAccuracyUpdate]);

  return null; // This is a utility component, doesn't render anything
};

export const calculateWPM = (
  correctWords: number, 
  timeElapsedInSeconds: number, 
  includeErrors: boolean = false,
  errors: number = 0
): number => {
  if (timeElapsedInSeconds === 0) return 0;
  
  const grossWPM = (correctWords * 60) / timeElapsedInSeconds;
  
  if (includeErrors) {
    // Net WPM = Gross WPM - (errors / time in minutes)
    const timeInMinutes = timeElapsedInSeconds / 60;
    const netWPM = grossWPM - (errors / timeInMinutes);
    return Math.max(0, Math.round(netWPM));
  }
  
  return Math.round(grossWPM);
};

export const calculateRealTimeStats = (
  userInput: string,
  targetText: string,
  startTime: number | null
) => {
  if (!startTime) {
    return {
      wpm: 0,
      accuracy: 100,
      correctChars: 0,
      totalChars: 0,
      errors: 0,
      progress: 0
    };
  }

  const timeElapsed = (Date.now() - startTime) / 1000;
  
  // Calculate accuracy
  let correctChars = 0;
  let errors = 0;
  
  for (let i = 0; i < userInput.length; i++) {
    if (i < targetText.length && userInput[i] === targetText[i]) {
      correctChars++;
    } else {
      errors++;
    }
  }

  const accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100;
  
  // Calculate WPM (assuming average word length of 5 characters)
  const wordsTyped = correctChars / 5;
  const wpm = timeElapsed > 0 ? Math.round((wordsTyped * 60) / timeElapsed) : 0;
  
  // Calculate progress
  const progress = targetText.length > 0 ? (userInput.length / targetText.length) * 100 : 0;

  return {
    wpm,
    accuracy,
    correctChars,
    totalChars: userInput.length,
    errors,
    progress: Math.min(progress, 100)
  };
};

export default AccuracyCalculator;