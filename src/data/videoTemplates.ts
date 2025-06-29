import { VideoTemplate } from '../types/videoTemplates';

export const PREDEFINED_VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    templateId: 'hero-product-001',
    name: 'Hero Product',
    category: 'ecommerce',
    description:
      'Perfect for product launches and featured items. Clean hero image with bold headline.',
    thumbnail: '/templates/hero-product-thumb.jpg',
    totalDuration: 8000,
    aspectRatio: '9:16',
    tags: ['product', 'hero', 'ecommerce', 'clean'],
    frames: [
      {
        frameNumber: 1,
        duration: 3000,
        backgroundColor: '#f8f9fa',
        elements: {
          heroImage: {
            slot: 'background',
            position: { x: 0, y: 0, w: 1080, h: 1200 },
            zIndex: 1,
            required: true,
          },
          headline: {
            slot: 'text',
            position: { x: 100, y: 800, w: 880, h: 200 },
            style: {
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
            },
            maxLines: 2,
            maxCharacters: 60,
            zIndex: 3,
            required: true,
          },
          brandLogo: {
            slot: 'logo',
            position: { x: 100, y: 100, w: 200, h: 80 },
            zIndex: 2,
          },
        },
        animation: {
          in: 'fadeIn',
          out: 'slideUp',
          duration: 800,
          easing: 'ease-out',
        },
      },
      {
        frameNumber: 2,
        duration: 3000,
        backgroundColor: '#ffffff',
        elements: {
          bodyText: {
            slot: 'text',
            position: { x: 100, y: 300, w: 880, h: 400 },
            style: {
              fontSize: '36px',
              fontWeight: 'medium',
              color: '#333333',
              textAlign: 'center',
            },
            maxLines: 4,
            maxCharacters: 120,
            zIndex: 2,
            required: true,
          },
          supportingImage: {
            slot: 'image',
            position: { x: 200, y: 800, w: 680, h: 400 },
            zIndex: 1,
          },
        },
        animation: {
          in: 'slideUp',
          out: 'fadeOut',
          duration: 600,
        },
      },
      {
        frameNumber: 3,
        duration: 2000,
        backgroundColor: '#000000',
        elements: {
          ctaButton: {
            slot: 'button',
            position: { x: 200, y: 800, w: 680, h: 80 },
            style: {
              backgroundColor: '#FF6B35',
              borderRadius: '40px',
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
            },
            maxCharacters: 20,
            zIndex: 3,
            required: true,
          },
          logo: {
            slot: 'logo',
            position: { x: 400, y: 1200, w: 280, h: 100 },
            zIndex: 2,
          },
          contactInfo: {
            slot: 'text',
            position: { x: 100, y: 1400, w: 880, h: 80 },
            style: {
              fontSize: '24px',
              color: 'white',
              textAlign: 'center',
            },
            maxCharacters: 50,
            zIndex: 2,
          },
        },
        animation: {
          in: 'zoomIn',
          out: 'fadeOut',
          duration: 600,
        },
      },
    ],
    brandGuidelines: {
      primaryColor: '#FF6B35',
      secondaryColor: '#F7931E',
      fontFamily: 'Inter',
      logoPosition: 'bottom-center',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    templateId: 'social-proof-001',
    name: 'Social Proof',
    category: 'social-proof',
    description: 'Build trust with customer testimonials and user-generated content.',
    thumbnail: '/templates/social-proof-thumb.jpg',
    totalDuration: 8000,
    aspectRatio: '9:16',
    tags: ['testimonial', 'reviews', 'social', 'trust'],
    frames: [
      {
        frameNumber: 1,
        duration: 3000,
        backgroundColor: '#f0f8ff',
        elements: {
          customerImage: {
            slot: 'image',
            position: { x: 300, y: 200, w: 480, h: 480 },
            style: { borderRadius: '50%' },
            zIndex: 2,
            required: true,
          },
          headline: {
            slot: 'text',
            position: { x: 100, y: 800, w: 880, h: 200 },
            style: {
              fontSize: '42px',
              fontWeight: 'bold',
              color: '#2c3e50',
              textAlign: 'center',
            },
            maxLines: 2,
            maxCharacters: 50,
            zIndex: 3,
            required: true,
          },
        },
        animation: {
          in: 'fadeIn',
          out: 'slideLeft',
          duration: 800,
        },
      },
      {
        frameNumber: 2,
        duration: 3000,
        backgroundColor: '#ffffff',
        elements: {
          testimonialText: {
            slot: 'text',
            position: { x: 100, y: 400, w: 880, h: 600 },
            style: {
              fontSize: '32px',
              fontWeight: 'normal',
              color: '#34495e',
              textAlign: 'center',
              fontStyle: 'italic',
            },
            maxLines: 6,
            maxCharacters: 200,
            zIndex: 2,
            required: true,
          },
          quoteMarks: {
            slot: 'text',
            position: { x: 100, y: 300, w: 880, h: 100 },
            style: {
              fontSize: '80px',
              color: '#3498db',
              textAlign: 'center',
            },
            zIndex: 1,
          },
        },
        animation: {
          in: 'slideRight',
          out: 'fadeOut',
          duration: 600,
        },
      },
      {
        frameNumber: 3,
        duration: 2000,
        backgroundColor: '#3498db',
        elements: {
          ctaButton: {
            slot: 'button',
            position: { x: 200, y: 700, w: 680, h: 80 },
            style: {
              backgroundColor: '#ffffff',
              borderRadius: '40px',
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#3498db',
              textAlign: 'center',
            },
            maxCharacters: 25,
            zIndex: 3,
            required: true,
          },
          trustBadge: {
            slot: 'text',
            position: { x: 100, y: 900, w: 880, h: 100 },
            style: {
              fontSize: '24px',
              color: 'white',
              textAlign: 'center',
            },
            maxCharacters: 40,
            zIndex: 2,
          },
        },
        animation: {
          in: 'zoomIn',
          out: 'fadeOut',
          duration: 600,
        },
      },
    ],
    brandGuidelines: {
      primaryColor: '#3498db',
      secondaryColor: '#2980b9',
      fontFamily: 'Inter',
      logoPosition: 'top-right',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    templateId: 'problem-solution-001',
    name: 'Problem/Solution',
    category: 'problem-solution',
    description: 'Highlight pain points and present your solution effectively.',
    thumbnail: '/templates/problem-solution-thumb.jpg',
    totalDuration: 8000,
    aspectRatio: '9:16',
    tags: ['problem', 'solution', 'before-after', 'transformation'],
    frames: [
      {
        frameNumber: 1,
        duration: 3000,
        backgroundColor: '#e74c3c',
        elements: {
          problemImage: {
            slot: 'image',
            position: { x: 100, y: 200, w: 880, h: 600 },
            style: { borderRadius: '20px', opacity: '0.8' },
            zIndex: 1,
            required: true,
          },
          problemText: {
            slot: 'text',
            position: { x: 100, y: 900, w: 880, h: 200 },
            style: {
              fontSize: '40px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
            },
            maxLines: 2,
            maxCharacters: 60,
            zIndex: 2,
            required: true,
          },
        },
        animation: {
          in: 'slideDown',
          out: 'slideUp',
          duration: 800,
        },
      },
      {
        frameNumber: 2,
        duration: 3000,
        backgroundColor: '#27ae60',
        elements: {
          solutionImage: {
            slot: 'image',
            position: { x: 100, y: 200, w: 880, h: 600 },
            style: { borderRadius: '20px' },
            zIndex: 1,
            required: true,
          },
          solutionText: {
            slot: 'text',
            position: { x: 100, y: 900, w: 880, h: 200 },
            style: {
              fontSize: '36px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
            },
            maxLines: 3,
            maxCharacters: 80,
            zIndex: 2,
            required: true,
          },
        },
        animation: {
          in: 'slideUp',
          out: 'fadeOut',
          duration: 600,
        },
      },
      {
        frameNumber: 3,
        duration: 2000,
        backgroundColor: '#2c3e50',
        elements: {
          ctaButton: {
            slot: 'button',
            position: { x: 150, y: 800, w: 780, h: 100 },
            style: {
              backgroundColor: '#f39c12',
              borderRadius: '50px',
              fontSize: '36px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
            },
            maxCharacters: 20,
            zIndex: 3,
            required: true,
          },
          benefitsList: {
            slot: 'text',
            position: { x: 100, y: 400, w: 880, h: 300 },
            style: {
              fontSize: '28px',
              color: 'white',
              textAlign: 'center',
            },
            maxLines: 4,
            maxCharacters: 100,
            zIndex: 2,
          },
        },
        animation: {
          in: 'zoomIn',
          out: 'fadeOut',
          duration: 600,
        },
      },
    ],
    brandGuidelines: {
      primaryColor: '#f39c12',
      secondaryColor: '#e67e22',
      fontFamily: 'Inter',
      logoPosition: 'bottom-center',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    templateId: 'data-driven-001',
    name: 'Data Driven',
    category: 'data-driven',
    description: 'Present compelling statistics and performance metrics.',
    thumbnail: '/templates/data-driven-thumb.jpg',
    totalDuration: 8000,
    aspectRatio: '9:16',
    tags: ['statistics', 'data', 'metrics', 'performance'],
    frames: [
      {
        frameNumber: 1,
        duration: 3000,
        backgroundColor: '#34495e',
        elements: {
          statNumber: {
            slot: 'text',
            position: { x: 100, y: 400, w: 880, h: 300 },
            style: {
              fontSize: '120px',
              fontWeight: 'bold',
              color: '#3498db',
              textAlign: 'center',
            },
            maxCharacters: 10,
            zIndex: 2,
            required: true,
          },
          statLabel: {
            slot: 'text',
            position: { x: 100, y: 750, w: 880, h: 150 },
            style: {
              fontSize: '32px',
              fontWeight: 'medium',
              color: 'white',
              textAlign: 'center',
            },
            maxLines: 2,
            maxCharacters: 50,
            zIndex: 2,
            required: true,
          },
        },
        animation: {
          in: 'zoomIn',
          out: 'fadeOut',
          duration: 1000,
        },
      },
      {
        frameNumber: 2,
        duration: 3000,
        backgroundColor: '#ecf0f1',
        elements: {
          chartImage: {
            slot: 'image',
            position: { x: 100, y: 300, w: 880, h: 600 },
            zIndex: 1,
            required: true,
          },
          dataInsight: {
            slot: 'text',
            position: { x: 100, y: 1000, w: 880, h: 200 },
            style: {
              fontSize: '30px',
              fontWeight: 'medium',
              color: '#2c3e50',
              textAlign: 'center',
            },
            maxLines: 3,
            maxCharacters: 80,
            zIndex: 2,
            required: true,
          },
        },
        animation: {
          in: 'slideUp',
          out: 'slideDown',
          duration: 600,
        },
      },
      {
        frameNumber: 3,
        duration: 2000,
        backgroundColor: '#3498db',
        elements: {
          ctaButton: {
            slot: 'button',
            position: { x: 200, y: 800, w: 680, h: 80 },
            style: {
              backgroundColor: 'white',
              borderRadius: '40px',
              fontSize: '30px',
              fontWeight: 'bold',
              color: '#3498db',
              textAlign: 'center',
            },
            maxCharacters: 20,
            zIndex: 3,
            required: true,
          },
          logo: {
            slot: 'logo',
            position: { x: 400, y: 1200, w: 280, h: 100 },
            zIndex: 2,
          },
        },
        animation: {
          in: 'fadeIn',
          out: 'fadeOut',
          duration: 600,
        },
      },
    ],
    brandGuidelines: {
      primaryColor: '#3498db',
      secondaryColor: '#2980b9',
      fontFamily: 'Inter',
      logoPosition: 'bottom-center',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Template selection utilities
export const getTemplatesByCategory = (category: string) => {
  return PREDEFINED_VIDEO_TEMPLATES.filter(template => template.category === category);
};

export const getTemplateById = (templateId: string) => {
  return PREDEFINED_VIDEO_TEMPLATES.find(template => template.templateId === templateId);
};

export const searchTemplates = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return PREDEFINED_VIDEO_TEMPLATES.filter(
    template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};
