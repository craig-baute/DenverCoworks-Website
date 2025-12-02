
import React from 'react';
import { Check, X, AlertCircle, ThumbsUp } from 'lucide-react';
import { SeoSettings } from './DataContext';

interface SeoScoreProps {
  settings: SeoSettings;
}

const SeoScore: React.FC<SeoScoreProps> = ({ settings }) => {
  const { title, description, keywords, ogImage } = settings;

  // Scoring Logic
  let score = 0;
  const checks = [];

  // 1. Title Length (Optimal: 50-60 chars)
  if (title.length >= 30 && title.length <= 60) {
    score += 30;
    checks.push({ status: 'pass', text: 'Title length is optimal (30-60 chars)' });
  } else if (title.length > 0) {
    score += 15;
    checks.push({ status: 'warn', text: `Title is ${title.length < 30 ? 'too short' : 'too long'}. Aim for 50-60 chars.` });
  } else {
    checks.push({ status: 'fail', text: 'Title is missing' });
  }

  // 2. Description Length (Optimal: 150-160 chars)
  if (description.length >= 120 && description.length <= 160) {
    score += 30;
    checks.push({ status: 'pass', text: 'Description length is optimal' });
  } else if (description.length > 0) {
    score += 15;
    checks.push({ status: 'warn', text: `Description is ${description.length < 120 ? 'too short' : 'too long'}. Aim for 150-160 chars.` });
  } else {
    checks.push({ status: 'fail', text: 'Description is missing' });
  }

  // 3. Keywords
  const keywordCount = keywords.split(',').filter(k => k.trim().length > 0).length;
  if (keywordCount >= 3) {
    score += 20;
    checks.push({ status: 'pass', text: `Good keyword density (${keywordCount} found)` });
  } else if (keywordCount > 0) {
    score += 10;
    checks.push({ status: 'warn', text: 'Add more comma-separated keywords' });
  } else {
    checks.push({ status: 'fail', text: 'No keywords defined' });
  }

  // 4. Social Image
  if (ogImage && ogImage.startsWith('http')) {
    score += 20;
    checks.push({ status: 'pass', text: 'Social share image is set' });
  } else {
    checks.push({ status: 'fail', text: 'Missing social share image URL' });
  }

  // Color Logic
  const getColor = (s: number) => {
    if (s >= 90) return 'text-green-500 border-green-500';
    if (s >= 60) return 'text-yellow-500 border-yellow-500';
    return 'text-red-500 border-red-500';
  };
  
  const getBgColor = (s: number) => {
    if (s >= 90) return 'bg-green-500';
    if (s >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white border border-neutral-200 p-6 h-full">
      <h4 className="font-heavy uppercase text-lg mb-6">SEO Strength</h4>
      
      <div className="flex items-center justify-center mb-8">
        <div className={`relative w-32 h-32 rounded-full border-8 flex items-center justify-center ${getColor(score)}`}>
          <div className="text-center">
            <span className="text-4xl font-heavy block">{score}</span>
            <span className="text-xs uppercase font-bold text-neutral-400">/ 100</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {checks.map((check, idx) => (
          <div key={idx} className="flex items-start text-sm">
            <div className="mt-0.5 mr-3">
              {check.status === 'pass' && <Check className="w-4 h-4 text-green-500" />}
              {check.status === 'warn' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
              {check.status === 'fail' && <X className="w-4 h-4 text-red-500" />}
            </div>
            <span className={`
              ${check.status === 'pass' ? 'text-neutral-700' : ''}
              ${check.status === 'warn' ? 'text-neutral-600 font-medium' : ''}
              ${check.status === 'fail' ? 'text-red-600 font-bold' : ''}
            `}>
              {check.text}
            </span>
          </div>
        ))}
      </div>
      
      {score === 100 && (
        <div className="mt-6 bg-green-50 p-3 text-green-800 text-xs font-bold uppercase text-center rounded border border-green-200">
          <ThumbsUp className="w-4 h-4 inline mr-2" /> Fully Optimized
        </div>
      )}
    </div>
  );
};

export default SeoScore;
