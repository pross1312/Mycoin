import {useState} from "react";
import {FaClipboard, FaCheck} from "react-icons/fa";

export default function({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <button onClick={handleCopy} className="flex items-center w-full h-full cursor-pointer">
      {copied ? <FaCheck className="text-green-500" /> : <FaClipboard />}
    </button>
  );
}
