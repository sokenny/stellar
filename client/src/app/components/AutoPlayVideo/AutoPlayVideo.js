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
  animate = false,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationFrameRef = useRef();

  useEffect(() => {
    const videoElement = videoRef.current;

    const updateProgress = () => {
      if (videoElement) {
        const progress =
          (videoElement.currentTime / videoElement.duration) * 100;
        setProgress(progress);
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    if (videoElement && showProgress) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
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
          setIsVisible(true);
        } else if (!isIntersecting && isPlaying) {
          videoElement.pause();
          setIsPlaying(false);
          setIsVisible(false);
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
        } ${animate && isVisible ? styles.animate : ''}`}
        data-animate={animate}
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
