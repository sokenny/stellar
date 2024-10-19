'use client';

import { useRef, useEffect, useState } from 'react';
import styles from './AutoPlayVideo.module.css'; // Optional for custom styles

const AutoPlayVideo = ({ src, poster, width, className, onPlayClassName }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.intersectionRatio > 0.95;
        if (isIntersecting && !isPlaying) {
          videoElement.play();
          setIsPlaying(true);
        } else if (!isIntersecting && isPlaying) {
          videoElement.pause();
          setIsPlaying(false);
        }
      },
      {
        threshold: [0, 0.95],
      },
    );

    if (videoElement) {
      observer.observe(videoElement);
    }

    return () => {
      if (videoElement) {
        observer.unobserve(videoElement);
      }
    };
  }, [isPlaying]);

  return (
    <video
      ref={videoRef}
      className={`${styles.video} ${className ? className : ''} ${
        isPlaying ? onPlayClassName : ''
      }`}
      src={src}
      poster={poster}
      width={width}
      muted
      loop
      playsInline
      controls={false}
    />
  );
};

export default AutoPlayVideo;
