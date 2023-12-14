import * as React from "react";
import type { SVGProps } from "react";
const SvgWagmi = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 421 198"
    {...props}
  >
    <path
      fill={props.color || "#fff"}
      fillRule="evenodd"
      d="M47.996 119.99c0 13.254 10.744 23.998 23.998 23.998h47.996c13.254 0 23.998-10.744 23.998-23.998V23.998C143.988 10.744 154.733 0 167.986 0c13.254 0 23.998 10.744 23.998 23.998v95.992c0 13.254 10.745 23.998 23.999 23.998h47.996c13.253 0 23.998-10.744 23.998-23.998V23.998C287.977 10.744 298.721 0 311.975 0c13.254 0 23.998 10.744 23.998 23.998v143.988c0 13.254-10.744 23.998-23.998 23.998H23.998C10.744 191.984 0 181.24 0 167.986V23.998C0 10.744 10.744 0 23.998 0c13.254 0 23.998 10.744 23.998 23.998v95.992Zm340.544 77.708c17.672 0 31.998-14.325 31.998-31.997s-14.326-31.997-31.998-31.997c-17.671 0-31.997 14.325-31.997 31.997s14.326 31.997 31.997 31.997Z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgWagmi;