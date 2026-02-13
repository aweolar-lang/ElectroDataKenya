"use client";

import { useEffect, useState } from "react";
import ConsentModal from "./ConsentModal";
import { useRouter } from "next/navigation";

export default function ConsentGuard() {
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. Wrap in setTimeout to push execution to the next event loop tick.
    // This avoids the "synchronous setState" warning.
    const timer = setTimeout(() => {
      const consent = localStorage.getItem("consent_given");
      if (!consent) {
        setShow(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("consent_given", "1");
    
    // Ensure an anonymous session ID exists
    if (!localStorage.getItem("anon_session")) {
      localStorage.setItem("anon_session", crypto.randomUUID());
    }
    
    setShow(false);
  };

  const handleDecline = () => {
    // If they decline, redirect to home
    router.push("/"); 
  };

  if (!show) return null;

  return (
    <ConsentModal 
      isOpen={show} 
      onAccept={handleAccept} 
      onClose={handleDecline} 
    />
  );
}