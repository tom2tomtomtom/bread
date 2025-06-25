import { CAMPAIGN_MOMENTS } from '../config/app';

export interface CampaignMoment {
  name: string;
  date: string;
  description: string;
  keywords: string[];
}

// Get all available campaign moments
export const getCampaignMoments = (): CampaignMoment[] => {
  return CAMPAIGN_MOMENTS;
};

// Get upcoming campaign moments (next 3 months)
export const getUpcomingMoments = (): CampaignMoment[] => {
  const now = new Date();
  const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

  return CAMPAIGN_MOMENTS.filter(moment => {
    // Simple date parsing - in a real app, you'd want more robust date handling
    const momentDate = new Date(moment.date);
    return momentDate >= now && momentDate <= threeMonthsFromNow;
  });
};

// Generate brief text for a campaign moment
export const generateMomentBrief = (moment: CampaignMoment): string => {
  return `${moment.name} is approaching (${moment.date}). Generate creative territories for Everyday Rewards to drive engagement and showcase value during this key shopping moment. 

Context: ${moment.description}

Focus on positioning Everyday Rewards as the smart choice for everyday value, contrasting with limited-time sales events and highlighting the benefits of consistent rewards over flash sales.

Key themes to consider: ${moment.keywords.join(', ')}`;
};

// Detect campaign moment from brief text
export const detectCampaignMoment = (brief: string): CampaignMoment | null => {
  const briefLower = brief.toLowerCase();

  for (const moment of CAMPAIGN_MOMENTS) {
    // Check if any of the moment's keywords appear in the brief
    const hasKeyword = moment.keywords.some(keyword => briefLower.includes(keyword.toLowerCase()));

    if (hasKeyword) {
      return moment;
    }
  }

  return null;
};

// Get seasonal context for a given date
export const getSeasonalContext = (date: Date = new Date()): string => {
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed

  if (month >= 12 || month <= 2) {
    return 'summer'; // Australian summer
  } else if (month >= 3 && month <= 5) {
    return 'autumn';
  } else if (month >= 6 && month <= 8) {
    return 'winter';
  } else {
    return 'spring';
  }
};

// Get relevant moments for current season
export const getSeasonalMoments = (): CampaignMoment[] => {
  const season = getSeasonalContext();
  const seasonalKeywords = {
    summer: ['christmas', 'holiday', 'new year', 'australia day'],
    autumn: ['back to school', 'easter', 'mothers day'],
    winter: ['eofy', 'tax', 'fathers day'],
    spring: ['black friday', 'spring', 'melbourne cup'],
  };

  const keywords = seasonalKeywords[season as keyof typeof seasonalKeywords] || [];

  return CAMPAIGN_MOMENTS.filter(moment =>
    moment.keywords.some(keyword =>
      keywords.some(seasonalKeyword =>
        keyword.toLowerCase().includes(seasonalKeyword.toLowerCase())
      )
    )
  );
};

// Format moment for display
export const formatMomentForDisplay = (moment: CampaignMoment): string => {
  return `${moment.name} (${moment.date})`;
};

// Get moment suggestions based on brief analysis
export const getMomentSuggestions = (brief: string): CampaignMoment[] => {
  const detectedMoment = detectCampaignMoment(brief);

  if (detectedMoment) {
    // If we detected a specific moment, return related moments
    return CAMPAIGN_MOMENTS.filter(
      moment =>
        moment !== detectedMoment &&
        moment.keywords.some(keyword => detectedMoment.keywords.includes(keyword))
    ).slice(0, 3); // Return top 3 related moments
  }

  // Otherwise, return seasonal moments
  return getSeasonalMoments().slice(0, 3);
};

// Validate if a moment is still relevant (not too far in the past)
export const isMomentRelevant = (moment: CampaignMoment): boolean => {
  const now = new Date();
  const momentDate = new Date(moment.date);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

  return momentDate >= sixMonthsAgo;
};

// Get only relevant moments
export const getRelevantMoments = (): CampaignMoment[] => {
  return CAMPAIGN_MOMENTS.filter(isMomentRelevant);
};
