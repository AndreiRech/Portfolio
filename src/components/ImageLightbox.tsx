"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
export default function ImageLightbox({
  src,
  alt,
  close,
}: {
  src: string;
  alt: string;
  close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { copy: c } = useSettings();
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="lightbox"
      aria-label={alt}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <button
        autoFocus
        className="icon-button lightbox-close"
        aria-label={c.close}
        onClick={close}
      >
        <X size={24} />
      </button>
      <div className="lightbox-image">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="95vw"
          className="object-contain"
        />
      </div>
    </dialog>
  );
}
