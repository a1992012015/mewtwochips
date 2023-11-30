"use client";

import "./Randomizer.css";
import { useEffect, useState } from "react";

interface IProps {
  winIndex: number;
  items: Array<{ name: string; color: string }>;
}

const TIME_TO_SPIN_WHEEL = 4000;

export function Randomizer(props: IProps) {
  const { items, winIndex } = props;

  console.log("winIndex", winIndex);

  const [animationFinished, setAnimationFinished] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    setAnimationStarted(true);

    return () => {
      setAnimationStarted(false)
    }
  }, []);

  const rotate = 360 / items.length;

  const rotateNumber = 360 * 3 + (360 - winIndex * rotate + 90 - rotate / 2);

  const rotateCss = {
    transitionDuration: `${TIME_TO_SPIN_WHEEL}ms`,
    transform: `rotate(${rotateNumber}deg)`
  };

  const circleBottomCss = (index: number) => {
    return {
      transform: `rotate(${rotate * index}deg)`
    };
  };

  const circleTopCss = (index: number, color?: string) => {
    return {
      transform: `rotate(${rotate}deg)`,
      background: color || items[index].color
    };
  };

  const textCss = () => {
    return {
      transform: `rotate(${-90 - rotate / 2}deg)`
    };
  };

  // 圆心坐标
  const cx = 200;
  const cy = 200;

  // 圆的半径
  const r = 192;

  const start = -90;
  const end = 90;

  console.log("大小", end - start);

  // 起始角度和结束角度（以弧度表示）
  const startAngle = start * Math.PI / 180; // 起始角度为30度，转换为弧度
  const endAngle = end * Math.PI / 180; // 结束角度为120度，转换为弧度

  // 计算起点坐标
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);

  // 计算终点坐标
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);

  // 输出起点和终点坐标
  console.log("起点坐标:", x1, y1);
  console.log("终点坐标:", x2, y2);

  return (
    <div className="w-full pt-[100%] relative">
      <div style={animationStarted ? rotateCss : undefined}
           className="absolute bottom-0 left-0 right-0 top-0 transition">
        <div className="relative w-full h-full mask">

          {items.map((i, index) => {
            return (
              <div key={index} style={circleBottomCss(index)}
                   className="w-[96%] h-[96%] absolute top-[2%] left-[2%] circle-bottom">
                <div style={circleTopCss(index)}
                     className="w-full h-full rounded-full text-center circle-top">
                  <div style={textCss()} className="w-full h-full flex justify-center items-center">
                    <span className="text-white translate-x-1/2 pl-[110px]">
                      {i.name} {index + 1}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full absolute top-0 left-0"
               width="400"
               height="400" viewBox="0 0 400 400">
            <path
              d={`M200,200 L${x1},${y1} A192,192 0 ${end - start > 180 ? "1" : "0"} 1 ${x2},${y2} Z`}
              fill="transparent"
              stroke="red"
              strokeWidth="3"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
