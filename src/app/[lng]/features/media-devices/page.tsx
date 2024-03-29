"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Select } from "@radix-ui/themes";

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [options, setOptions] = useState<MediaDeviceInfo[]>([]);

  const x = 0;
  const y = 0;

  const renderCanvas = useCallback(
    (
      width: number,
      height: number,
      video: HTMLVideoElement,
      ctx: CanvasRenderingContext2D | null,
    ) => {
      const render = () => {
        window.requestAnimationFrame(render);
        ctx?.clearRect(x, y, width, height);
        ctx?.drawImage(video, x, y, width, height); //绘制视频
      };
      return render;
    },
    [x, y],
  );

  const initMedia = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const firstMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      firstMediaStream.getVideoTracks().forEach((track) => {
        console.log("track", track.id, track.kind);
        track.stop();
      });
      const mediaDeviceInfo = await navigator.mediaDevices.enumerateDevices();
      const videoInput = mediaDeviceInfo.filter((info) => {
        return info.kind === "videoinput";
      });
      console.log("videoInput", videoInput);
      setOptions(videoInput);
    }
  }, []);

  useEffect(() => {
    console.log("useEffect", canvasRef, videoRef);
    initMedia().then(() => {
      console.log("initMedia");
    });
  }, [initMedia]);

  const deviceChangeHandle = async (deviceId: string) => {
    console.log("deviceChangeHandle deviceId", deviceId);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: deviceId },
          },
        });
        console.log("mediaStream", mediaStream);
        video.srcObject = mediaStream;

        video.onloadedmetadata = function () {
          video.play().then(() => {
            console.log("play...");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            video.width = video.videoWidth;
            video.height = video.videoHeight;

            const renderHandle = renderCanvas(
              canvas.width,
              canvas.height,
              video,
              canvas.getContext("2d"),
            );

            renderHandle();
          });
        };
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Select.Root name="device" onValueChange={deviceChangeHandle}>
        <Select.Trigger className="min-w-[300px]" />
        <Select.Content>
          {options.map((device) => (
            <Select.Item key={device.deviceId} value={device.deviceId}>
              {device.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

      <video ref={videoRef} playsInline>
        视频流目前不可用。
      </video>

      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
