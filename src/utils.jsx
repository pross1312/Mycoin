export function formatTimestamp(timestamp) {
  if (timestamp < 60) return `${timestamp} secs`;
  if (timestamp < 3600) return `${Math.floor(timestamp / 60)} mins`;
  if (timestamp < 86400) return `${Math.floor(timestamp / 3600)} hours`;
  if (timestamp < 604800) return `${Math.floor(diff / 86400)} days`;
  return parseMilis(timestamp);
}

export function parseMilis(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  // return new Date(timestamp).toISOString()
}

export function HorizontalSep() {
  return (
    <div className="w-full bg-seperator-color h-[1px]">
    </div>
  );
}
