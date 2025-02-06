'use client';

import { useRef, useEffect, useState } from 'react';
import styles from './AutoPlayVideo.module.css'; // Optional for custom styles

const AutoPlayVideo = ({
  src,
  poster,
  width,
  className,
  onPlayClassName,
  showProgress = false,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const videoElement = videoRef.current;

    const handleTimeUpdate = () => {
      const progress = (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(progress);
    };

    if (videoElement && showProgress) {
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
    }

    return () => {
      if (videoElement && showProgress) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [showProgress]);

  useEffect(() => {
    const videoElement = videoRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.intersectionRatio > 0.6;
        if (isIntersecting && !isPlaying) {
          videoElement.play();
          setIsPlaying(true);
        } else if (!isIntersecting && isPlaying) {
          videoElement.pause();
          setIsPlaying(false);
        }
      },
      {
        threshold: [0, 0.6],
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
    <div className={styles.videoContainer}>
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
      {showProgress && (
        <div className={styles.progressBar}>
          <div className={styles.progress} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};

export default AutoPlayVideo;
