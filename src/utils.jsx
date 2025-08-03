import { Link } from "react-router-dom";

export function mapLinkIfNeeded(obj, prefix = "", maxLength = 100000) {
  if (typeof obj === "object" && "short" in obj) {
    const path = `${prefix}/${encodeURIComponent(obj.full)}`;
    prefix = prefix || "";
    const short = obj["short"];
    return (
      <Link to={path} className="link">{short.substr(0, maxLength) + (short.length < maxLength ? "" : "...")}</Link>
    );
  }
  return <span>{obj}</span>;
}

export function formatTimestamp(timestamp) {
  if (timestamp < 60) return `${timestamp} secs`;
  if (timestamp < 3600) return `${Math.floor(timestamp / 60)} mins`;
  if (timestamp < 86400) return `${Math.floor(timestamp / 3600)} hours`;
  if (timestamp < 604800*360) return `${Math.floor(timestamp / 86400)} days`;
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
