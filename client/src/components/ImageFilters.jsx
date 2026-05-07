export default function ImageFilters() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', pointerEvents: 'none' }}
    >
      <defs>
        <filter
          id="vendora-image-background"
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          {/* Make near-white image padding match the white product surfaces. */}
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.2126 0.7152 0.0722 0 0"
            result="backgroundMask"
          />
          <feComponentTransfer in="backgroundMask" result="whiteBackground">
            <feFuncA
              type="discrete"
              tableValues="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1"
            />
          </feComponentTransfer>
          <feComposite in="whiteBackground" in2="SourceGraphic" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}
