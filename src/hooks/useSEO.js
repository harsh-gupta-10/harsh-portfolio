import { useEffect } from "react";

const DEFAULT_TITLE = "Harsh Gupta | Front-End Developer, UI/UX Designer & IoT Engineer";
const DEFAULT_DESC = "Harsh Gupta is a front-end developer, UI/UX designer, and IoT engineer in Mumbai. Building complete real-world products from web interfaces to hardware.";
const DEFAULT_URL = "https://harshugupta.in/";
const DEFAULT_IMAGE = "https://harshugupta.in/og-image.png";

function setMetaTag(selector, attr, value) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    const [attrName, attrVal] = selector
      .replace("meta[", "")
      .replace("]", "")
      .split("=");
    el.setAttribute(attrName, attrVal.replace(/['"]/g, ""));
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function setCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

export function useSEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  canonical = DEFAULT_URL,
  image = DEFAULT_IMAGE,
  type = "website",
} = {}) {
  useEffect(() => {
    // 1. Page Title
    document.title = title;

    // 2. Meta description
    setMetaTag('meta[name="description"]', "content", description);

    // 3. Canonical link
    setCanonical(canonical);

    // 4. Open Graph
    setMetaTag('meta[property="og:title"]', "content", title);
    setMetaTag('meta[property="og:description"]', "content", description);
    setMetaTag('meta[property="og:url"]', "content", canonical);
    setMetaTag('meta[property="og:image"]', "content", image);
    setMetaTag('meta[property="og:type"]', "content", type);

    // 5. Twitter Card
    setMetaTag('meta[name="twitter:title"]', "content", title);
    setMetaTag('meta[name="twitter:description"]', "content", description);
    setMetaTag('meta[name="twitter:image"]', "content", image);
  }, [title, description, canonical, image, type]);
}

export default useSEO;
