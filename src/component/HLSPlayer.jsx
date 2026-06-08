// src/components/HLSPlayer.jsx
import React, { useEffect } from "react";
import { hlsStreamUrl } from "../config";

const HLSPlayer = ({
  src = hlsStreamUrl("gcs"),
  width = "100%",
  height = "100%",
  rotate = 0,
  onVideoInfo,
}) => {
  useEffect(() => {
    onVideoInfo?.({
      width: 1280,
      height: 720,
      bitrate: 0,
      fps: 30,
    });
  }, [onVideoInfo]);

  return (
    <div
      data-testid="hls-player"
      style={{
        position: "relative",
        display: "grid",
        placeItems: "center",
        width,
        height,
        overflow: "hidden",
        backgroundColor: "#000",
        color: "#dce8f4",
        transform: `rotate(${rotate}deg)`,
        transformOrigin: "center center",
      }}
    >
      <span>목업 영상</span>
      <small style={{ position: "absolute", bottom: 8, left: 8 }}>{src}</small>
    </div>
  );
};

export default HLSPlayer;
