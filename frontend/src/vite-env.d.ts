/// <reference types="vite/client" />

declare namespace React.JSX {
  interface IntrinsicElements {
    marquee: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { scrollamount?: number }
  }
}
