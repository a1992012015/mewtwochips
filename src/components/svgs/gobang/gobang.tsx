import * as React from "react";
import type { SVGProps } from "react";
const SvgGobang = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 16"
    {...props}
  >
    <circle cx={8} cy={8} r={8} fill="currentColor" />
  </svg>
);
export default SvgGobang;
