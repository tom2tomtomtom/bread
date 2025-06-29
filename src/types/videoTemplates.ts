// Video Template System Types

export interface VideoFrameElement {
  slot: 'background' | 'text' | 'button' | 'image' | 'logo';
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  style?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    borderRadius?: string;
    textAlign?: 'left' | 'center' | 'right';
    [key: string]: any;
  };
  maxLines?: number;
  maxCharacters?: number;
  zIndex: number;
  required?: boolean;
}

export interface VideoFrameAnimation {
  in:
    | 'fadeIn'
    | 'slideUp'
    | 'slideDown'
    | 'slideLeft'
    | 'slideRight'
    | 'zoomIn'
    | 'zoomOut'
    | 'typewriter';
  out: 'fadeOut' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'zoomOut' | 'zoomIn';
  duration: number; // milliseconds
  delay?: number;
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
}

export interface VideoFrame {
  frameNumber: 1 | 2 | 3;
  duration: number; // milliseconds
  elements: {
    [elementKey: string]: VideoFrameElement;
  };
  animation?: VideoFrameAnimation;
  backgroundColor?: string;
  backgroundImage?: string;
}

export interface VideoTemplate {
  templateId: string;
  name: string;
  category:
    | 'ecommerce'
    | 'social-proof'
    | 'problem-solution'
    | 'data-driven'
    | 'lifestyle'
    | 'promotional';
  description: string;
  thumbnail: string; // Preview image URL
  frames: [VideoFrame, VideoFrame, VideoFrame]; // Exactly 3 frames
  totalDuration: number; // Should be 8000ms
  aspectRatio: '9:16' | '16:9' | '1:1'; // Mobile, Desktop, Square
  brandGuidelines?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    logoPosition?:
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right'
      | 'bottom-center'
      | 'center';
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoContent {
  templateId: string;
  frame1Content: {
    heroImage?: string;
    headline?: string;
    logo?: string;
  };
  frame2Content: {
    bodyText?: string;
    supportingImage?: string;
    dataPoints?: string[];
  };
  frame3Content: {
    ctaText?: string;
    logo?: string;
    contactInfo?: string;
    website?: string;
  };
  brandColors?: {
    primary: string;
    secondary: string;
    text: string;
  };
}

export interface VideoExportSettings {
  format: 'mp4' | 'webm' | 'gif';
  quality: 'standard' | 'hd' | 'ultra';
  fps: 30 | 60;
  compression: 'high' | 'medium' | 'low';
  watermark?: boolean;
}

export interface VideoProject {
  projectId: string;
  templateId: string;
  content: VideoContent;
  exportSettings: VideoExportSettings;
  status: 'draft' | 'rendering' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  exportUrl?: string;
  previewUrl?: string;
}

// Template Categories
export const VIDEO_TEMPLATE_CATEGORIES = {
  ecommerce: {
    label: 'E-commerce',
    description: 'Product showcases, sales, promotions',
    icon: '🛒',
  },
  'social-proof': {
    label: 'Social Proof',
    description: 'Testimonials, reviews, user-generated content',
    icon: '👥',
  },
  'problem-solution': {
    label: 'Problem/Solution',
    description: 'Pain points and solutions',
    icon: '🎯',
  },
  'data-driven': {
    label: 'Data Driven',
    description: 'Statistics, charts, performance metrics',
    icon: '📊',
  },
  lifestyle: {
    label: 'Lifestyle',
    description: 'Brand experiences, emotional connections',
    icon: '✨',
  },
  promotional: {
    label: 'Promotional',
    description: 'Sales events, limited time offers',
    icon: '🔥',
  },
} as const;

// Predefined Animation Presets
export const ANIMATION_PRESETS = {
  'hero-entrance': {
    in: 'fadeIn' as const,
    out: 'slideUp' as const,
    duration: 800,
    easing: 'ease-out' as const,
  },
  'text-reveal': {
    in: 'typewriter' as const,
    out: 'fadeOut' as const,
    duration: 1000,
    easing: 'ease-in-out' as const,
  },
  'cta-pulse': {
    in: 'zoomIn' as const,
    out: 'fadeOut' as const,
    duration: 600,
    easing: 'ease-out' as const,
  },
  'slide-transition': {
    in: 'slideLeft' as const,
    out: 'slideRight' as const,
    duration: 500,
    easing: 'ease-in-out' as const,
  },
} as const;
