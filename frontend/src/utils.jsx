import {Link, useLocation} from "react-router-dom";
import {FaCoins} from "react-icons/fa";  
import {toast} from "react-toastify";

export function formatCurrency(amount) {
  return (
    <span className="font-semibold flex items-center gap-1 w-fit">
      {amount.toLocaleString()} <FaCoins />
    </span>
  );
}

export function formatLink(short_form, full = short_form) {
  return {
    short: short_form,
    full
  };
}

export function mapLinkIfNeeded(obj, prefix = "", maxLength = 100000) {
  if (typeof obj === "object" && "short" in obj) {
    const params = new URLSearchParams(obj);
    const path = `${prefix}?${params.toString()}`;
    prefix = prefix || "";
    const shortForm = obj["short"];
    const displayText =
      shortForm.length > maxLength
      ? shortForm.slice(0, maxLength) + "..."
      : shortForm;

    return (
      <Link to={path} className="link">
      {displayText}
      </Link>
    );
  }
  return <span>{obj}</span>;
}

export function getLink() {
  const params = new URLSearchParams(useLocation()?.search);
  return {
    short: params?.get("short"),
    full: params?.get("full"),
  }
}

export function getFullLink(obj) {
  return obj?.full || "";
}

export function getShortLink(obj) {
  return obj?.short || "";
}

export function formatTimestamp(timestamp) {
  const units = [
    { limit: 60000, div: 1000, label: "secs" },
    { limit: 3600000, div: 60000, label: "mins" },
    { limit: 86400000, div: 3600000, label: "hours" },
    { limit: 86400000 * 360, div: 86400000, label: "days" }
  ];

  for (const { limit, div, label } of units) {
    if (timestamp < limit) return `${Math.floor(timestamp / div)} ${label}`;
  }

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

export function capitalize(data) {
  if (data.length === 0) {
    return data;
  }
  if (typeof data === "string" && data.length > 0) {
    return data[0].toUpperCase() + data.substr(1);
  }
  if (Array.isArray(data)) {
    return data.map(x => capitalize(x));
  }
  if (typeof data === "object") {
    for (const [key, value] of Object.entries(data)) {
      const newKey = capitalize(key);
      if (newKey === key) continue;
      data[newKey] = value;
      delete data[key];
    }
    return data;
  }
}

export function displaySuccess(message) {
  console.log(message);
  toast.success(message);
}

export function displayError(message) {
  toast.error(message);
}
