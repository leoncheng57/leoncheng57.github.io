import { useEffect, useRef, useState } from "react";
import type { NextPage } from "next";
import styles from "./social.module.css";

type ContactProps = {
  label: string;
  value: string;
  href: string;
  icon: string;
  id: string;
};

const Contact = ({ label, value, href, icon, id }: ContactProps) => {
  const [open, setOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(href.startsWith("mailto:") ? value : href);
      setCopyStatus("Copied!");
    } catch {
      setCopyStatus("Could not copy. Select the address to copy it.");
    }
  };

  return (
        <div className={styles.emailContainer} ref={container}>
          <button
            ref={trigger}
            type="button"
            className={styles.handle}
            aria-label={label}
            aria-expanded={open}
            aria-controls={id}
            onClick={() => {
              setOpen(!open);
              setCopyStatus("");
            }}
          >
            <img alt="" src={icon} />
          </button>
          {open && (
            <div id={id} className={styles.popover}>
              <div className={styles.emailRow}>
                <a href={href}>{value}</a>
                <button type="button" onClick={copyValue} aria-label="Copy" title="Copy">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="8" y="8" width="12" height="12" rx="2" />
                    <path d="M16 8V4H4v12h4" />
                  </svg>
                </button>
              </div>
              <span role="status">{copyStatus}</span>
            </div>
          )}
        </div>
  );
};

const Social: NextPage = () => (
  <div className={styles.container}>
    <div className={styles.innerContainer}>
      <Contact
        label="Leon Cheng on GitHub"
        value="github.com/leoncheng57"
        href="https://github.com/leoncheng57/"
        icon="./icons/github-icon.svg"
        id="github-popover"
      />
      <Contact
        label="Email Leon Cheng"
        value="leonc@alum.mit.edu"
        href="mailto:leonc@alum.mit.edu"
        icon="./icons/email-icon.svg"
        id="email-popover"
      />
    </div>
  </div>
);

export default Social;
