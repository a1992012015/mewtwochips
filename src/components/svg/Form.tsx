import * as React from "react";
import type { SVGProps } from "react";
const SvgForm = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M22 6H2C.9 6 0 5.1 0 4V2C0 .9.9 0 2 0h20c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2zm0-2v1-1zM2 2v2h20V2H2zm20 13H2c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2h20c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2zm0-2v1-1zM2 11v2h20v-2H2zm9 12H2c-.5 0-1-.5-1-1v-2c0-.5.5-1 1-1h9c.6 0 1 .5 1 1v2c0 .5-.4 1-1 1z"
    />
    <path
      fill="currentColor"
      d="M11 24H2c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2h9c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2zm0-2v1-1zm-9-2v2h9v-2H2z"
    />
  </svg>
);
export default SvgForm;
