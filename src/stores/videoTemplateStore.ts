import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VideoTemplate, VideoContent } from '../types/videoTemplates';

interface VideoTemplateState {
  selectedTemplate: VideoTemplate | null;
  videoContent: VideoContent | null;
  isEditing: boolean;

  // Actions
  setSelectedTemplate: (template: VideoTemplate) => void;
  setVideoContent: (content: VideoContent) => void;
  updateFrameContent: (
    frameNumber: 1 | 2 | 3,
    content: Partial<
      VideoContent['frame1Content'] | VideoContent['frame2Content'] | VideoContent['frame3Content']
    >
  ) => void;
  setIsEditing: (editing: boolean) => void;
  clearVideoData: () => void;
}

export const useVideoTemplateStore = create<VideoTemplateState>()(
  persist(
    (set, get) => ({
      selectedTemplate: null,
      videoContent: null,
      isEditing: false,

      setSelectedTemplate: (template: VideoTemplate) => {
        set({
          selectedTemplate: template,
          // Initialize default content structure when template is selected
          videoContent: {
            templateId: template.templateId,
            frame1Content: {
              heroImage: '',
              headline: 'Experience True Wireless Freedom',
              logo: '',
            },
            frame2Content: {
              bodyText: 'Charge devices from 3 meters away',
              supportingImage: '',
              dataPoints: ['✓ No cables needed', '✓ Multiple devices', '✓ Safe technology'],
            },
            frame3Content: {
              ctaText: 'Pre-order Now',
              logo: '',
              contactInfo: '',
              website: '',
            },
            brandColors: {
              primary: '#6366f1',
              secondary: '#8b5cf6',
              text: '#ffffff',
            },
          },
        });
      },

      setVideoContent: (content: VideoContent) => {
        set({ videoContent: content });
      },

      updateFrameContent: (frameNumber, content) => {
        const { videoContent } = get();
        if (!videoContent) return;

        const updatedContent = { ...videoContent };

        switch (frameNumber) {
          case 1:
            updatedContent.frame1Content = { ...updatedContent.frame1Content, ...content };
            break;
          case 2:
            updatedContent.frame2Content = { ...updatedContent.frame2Content, ...content };
            break;
          case 3:
            updatedContent.frame3Content = { ...updatedContent.frame3Content, ...content };
            break;
        }

        set({ videoContent: updatedContent });
      },

      setIsEditing: (editing: boolean) => {
        set({ isEditing: editing });
      },

      clearVideoData: () => {
        set({
          selectedTemplate: null,
          videoContent: null,
          isEditing: false,
        });
      },
    }),
    {
      name: 'video-template-storage',
      partialize: state => ({
        selectedTemplate: state.selectedTemplate,
        videoContent: state.videoContent,
      }),
    }
  )
);
