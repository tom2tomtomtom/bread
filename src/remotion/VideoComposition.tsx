import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
} from 'remotion';
import { VideoContent, VideoTemplate } from '../types/videoTemplates';

interface VideoCompositionProps {
  template: VideoTemplate;
  content: VideoContent;
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({ template, content }) => {
  const { fps } = useVideoConfig();

  // Calculate frame durations based on template
  const frame1Duration = Math.round((template.frames[0].duration / 1000) * fps); // 3 seconds
  const frame2Duration = Math.round((template.frames[1].duration / 1000) * fps); // 3 seconds
  const frame3Duration = Math.round((template.frames[2].duration / 1000) * fps); // 2 seconds

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Frame 1: Hook */}
      <Sequence from={0} durationInFrames={frame1Duration}>
        <Frame1 template={template.frames[0]} content={content.frame1Content} fps={fps} />
      </Sequence>

      {/* Frame 2: Value */}
      <Sequence from={frame1Duration} durationInFrames={frame2Duration}>
        <Frame2 template={template.frames[1]} content={content.frame2Content} fps={fps} />
      </Sequence>

      {/* Frame 3: Action */}
      <Sequence from={frame1Duration + frame2Duration} durationInFrames={frame3Duration}>
        <Frame3 template={template.frames[2]} content={content.frame3Content} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Frame 1: Hook Component
const Frame1: React.FC<{
  template: any;
  content: any;
  fps: number;
}> = ({ template, content, fps }) => {
  const frame = useCurrentFrame();

  // Animation: Fade in + slide up
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(frame, [0, 30], [50, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: template.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Background Image if provided */}
      {content.backgroundImage && (
        <AbsoluteFill>
          <img
            src={content.backgroundImage}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.3,
            }}
          />
        </AbsoluteFill>
      )}

      {/* Main Headline */}
      <h1
        style={{
          fontSize: '72px',
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center',
          margin: 0,
          padding: '0 40px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          lineHeight: 1.2,
        }}
      >
        {content.headline || 'Experience True Wireless Freedom'}
      </h1>

      {/* Subheadline */}
      {content.subheadline && (
        <p
          style={{
            fontSize: '32px',
            color: '#ffffff',
            textAlign: 'center',
            margin: '20px 0 0 0',
            opacity: 0.9,
            textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
          }}
        >
          {content.subheadline}
        </p>
      )}
    </AbsoluteFill>
  );
};

// Frame 2: Value Component
const Frame2: React.FC<{
  template: any;
  content: any;
  fps: number;
}> = ({ template, content, fps }) => {
  const frame = useCurrentFrame();

  // Animation: Zoom in effect
  const scale = spring({
    frame,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
    },
    from: 0.8,
    to: 1,
  });

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: template.backgroundColor || 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {/* Background Image if provided */}
      {content.backgroundImage && (
        <AbsoluteFill>
          <img
            src={content.backgroundImage}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.4,
            }}
          />
        </AbsoluteFill>
      )}

      {/* Value Proposition */}
      <div style={{ textAlign: 'center', padding: '0 60px' }}>
        <h2
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: '#ffffff',
            margin: '0 0 30px 0',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            lineHeight: 1.2,
          }}
        >
          {content.bodyText || 'Charge devices from 3 meters away'}
        </h2>

        {/* Key Benefits */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          {['✓ No cables needed', '✓ Multiple devices', '✓ Safe technology'].map(
            (benefit, index) => (
              <div
                key={index}
                style={{
                  fontSize: '24px',
                  color: '#ffffff',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {benefit}
              </div>
            )
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Frame 3: Action Component
const Frame3: React.FC<{
  template: any;
  content: any;
  fps: number;
}> = ({ template, content, fps }) => {
  const frame = useCurrentFrame();

  // Animation: Slide in from right
  const translateX = interpolate(frame, [0, 25], [100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pulsing CTA button
  const buttonScale = interpolate(
    frame % 60, // Pulse every 2 seconds at 30fps
    [0, 15, 30, 45, 60],
    [1, 1.05, 1, 1.05, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill
      style={{
        background: template.backgroundColor || 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `translateX(${translateX}px)`,
      }}
    >
      {/* Background Image if provided */}
      {content.backgroundImage && (
        <AbsoluteFill>
          <img
            src={content.backgroundImage}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.3,
            }}
          />
        </AbsoluteFill>
      )}

      {/* Call to Action */}
      <div style={{ textAlign: 'center' }}>
        <h3
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#ffffff',
            margin: '0 0 40px 0',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          {content.ctaHeadline || 'Ready to Experience the Future?'}
        </h3>

        {/* CTA Button */}
        <div
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#000000',
            backgroundColor: '#ffffff',
            padding: '20px 60px',
            borderRadius: '50px',
            border: '3px solid #000000',
            textShadow: 'none',
            transform: `scale(${buttonScale})`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            cursor: 'pointer',
          }}
        >
          {content.ctaText || 'Pre-order Now'}
        </div>

        {/* Urgency Text */}
        <p
          style={{
            fontSize: '20px',
            color: '#ffffff',
            margin: '20px 0 0 0',
            opacity: 0.9,
            textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
          }}
        >
          Limited time early bird pricing
        </p>
      </div>
    </AbsoluteFill>
  );
};
