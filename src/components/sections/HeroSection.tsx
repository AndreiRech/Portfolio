// src/components/sections/HeroSection.tsx
'use client';

import { useRef, useCallback, useEffect, useState, CSSProperties, Fragment } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { LinkedinIcon, GithubIcon } from '@/components/icons';
import { useSettings } from '@/context/SettingsContext';
import { HeroLink } from '@/types';

const DRIFT_RADIUS = 200;
const SPRING_CONFIG = { stiffness: 220, damping: 24, mass: 0.6 };

/** Split per word, not as one string: the plate rewraps between words at
    narrow widths instead of overflowing, and the entrance stagger keeps
    counting across the break via `startIndex`. */
const NAME_WORDS = ['ANDREI', 'RECH'];

/** Where each word's first letter falls in the one continuous stagger.
    Derived rather than written out so renaming or resplitting `NAME_WORDS`
    can't silently desynchronise the entrance. */
const LETTER_START_INDEX = NAME_WORDS.map((_, w) =>
  NAME_WORDS.slice(0, w).reduce((n, word) => n + word.length, 0)
);

/** One clock for the whole entrance. The first letter starts to rise at
    `LETTER_LEAD` and each one after it falls `LETTER_STAGGER` further behind;
    the plate underneath is given exactly `LETTER_LEAD` to finish its own fade,
    so the per-letter stagger is never composited through a fading parent. */
const LETTER_LEAD = 0.3;
const LETTER_STAGGER = 0.04;

/** Carried over from the pre-redesign meta row, which came in on the same two
    beats — the collage re-cuts what those beats reveal, not when. */
const ROLE_DELAY = 0.9;
const LINKS_DELAY = 1.05;

const HERO_LINKS: HeroLink[] = [
  { id: 'linkedin', component: LinkedinIcon, href: 'https://www.linkedin.com/in/rechandrei/', label: 'LinkedIn', tilt: '-1.5deg' },
  { id: 'github', component: GithubIcon, href: 'https://github.com/AndreiRech', label: 'GitHub', tilt: '2deg' },
];

interface DriftCharProps { char: string; index: number; }

function DriftChar({ char, index }: DriftCharProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const x = useSpring(targetX, SPRING_CONFIG);
  const y = useSpring(targetY, SPRING_CONFIG);
  const rotate = useTransform(x, (latestX) => (latestX / DRIFT_RADIUS) * 6);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(dist, DRIFT_RADIUS);
      const scale = clamped / dist;
      targetX.set(dx * scale * 0.7);
      targetY.set(dy * scale * 0.7);
    }, [targetX, targetY]);

  const handleMouseLeave = useCallback(() => {
    targetX.set(0);
    targetY.set(0);
  }, [targetX, targetY]);

  const entranceDelay = LETTER_LEAD + index * LETTER_STAGGER;

  return (
    <motion.span
      ref={ref}
      data-cursor-hover
      className="inline-block cursor-none"
      style={{ x, y, rotate, display: 'inline-block' }}
      initial={{ opacity: 0, y: 40, color: 'var(--color-paper)' }}
      animate={{ opacity: 1, y: 0, color: 'var(--color-paper)' }}
      whileHover={{ color: 'var(--color-mustard)' }}
      transition={{
        opacity: { duration: 0.5, delay: entranceDelay },
        y: { duration: 0.9, delay: entranceDelay, ease: [0.16, 1, 0.3, 1] },
        color: { duration: 0.3, ease: 'easeOut' }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-hidden="true"
    >
      {char}
    </motion.span>
  );
}

function SplitText({ text, startIndex = 0 }: { text: string; startIndex?: number; }) {
  return (
    <>
      {text.split('').map((char, i) => (
        <DriftChar key={i} char={char} index={startIndex + i} />
      ))}
    </>
  );
}

export default function HeroSection() {
  const { t } = useSettings();
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    const today = new Date();
    setFormattedDate(
      today.toLocaleDateString(t('hero_date_locale'), {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    );
  }, [t]);

  return (
    <section id="hero" className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 py-28 md:px-10">
      <h1 className="sr-only">Andrei Rech</h1>

      {/* Each piece is pasted a little further right and lapping the one above
          it, so the lockup reads as scraps stuck down in passes rather than as
          a stack of centered rows. */}
      <div className="mx-auto w-full max-w-5xl">
        <motion.div
          className="hero-label w-fit bg-plum px-5 py-3 md:px-8 md:py-5"
          style={{ '--hero-tilt': '-1.8deg', '--hero-shadow': 'var(--color-blood)' } as CSSProperties}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: LETTER_LEAD, ease: 'easeOut' }}
          aria-hidden="true"
        >
          {/* The inset rule the reference's labels are printed with. */}
          <span className="pointer-events-none absolute inset-1.5 border-2 border-paper/25 md:inset-2.5" />

          <p
            className="relative select-none text-[15vw] leading-[0.9] font-black uppercase md:text-[min(9vw,8rem)]"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.01em' }}
          >
            {NAME_WORDS.map((word, w) => (
              <Fragment key={word}>
                {/* A plain space between two inline-blocks: collapsible, so it
                    is the only place the plate is allowed to break. */}
                {w > 0 && ' '}
                <span className="inline-block whitespace-nowrap">
                  <SplitText text={word} startIndex={LETTER_START_INDEX[w]} />
                </span>
              </Fragment>
            ))}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: ROLE_DELAY, ease: [0.16, 1, 0.3, 1] }}
          /* The row's own box spans the full width, but only the scraps in it
             are physically on top of the plate — so the box lets the pointer
             through and each scrap takes it back. Without this, the strip the
             row laps over would swallow hover on the `DriftChar` letters
             underneath it. */
          className="pointer-events-none relative z-10 -mt-3 flex flex-wrap items-start gap-y-3 pl-4 md:-mt-5 md:pl-20"
        >
          <div
            className="hero-label pointer-events-auto bg-blood px-4 py-2 md:px-6 md:py-2.5"
            style={{ '--hero-tilt': '2.2deg' } as CSSProperties}
          >
            <span
              className="text-lg font-black tracking-wide text-paper uppercase md:text-2xl"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {t('hero_role')}
            </span>
          </div>

          {/* Held back until the locale-formatted date exists rather than
              reserving a width for it: an empty bordered scrap that then grows
              to fit reads as a glitch, and the effect resolves long before this
              row animates in anyway. */}
          {formattedDate && (
            <div
              /* Laps the role label rather than sitting beside it — later in
                 the row, so it paints over. `--hero-edge` flips to ink because
                 the default cream edge would vanish into this scrap's fill. */
              className="hero-label pointer-events-auto -ml-3 mt-4 bg-paper px-3 py-1.5 md:-ml-6 md:mt-6"
              style={{ '--hero-tilt': '-3deg', '--hero-edge': 'var(--color-ink)' } as CSSProperties}
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-ink uppercase md:text-xs">
                {formattedDate}
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: LINKS_DELAY, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none relative z-20 -mt-3 flex flex-wrap items-center gap-3 pl-4 md:-mt-4 md:pl-36"
        >
          {HERO_LINKS.map(({ id, component: Icon, href, label, tilt }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-label glitch-hover pointer-events-auto flex items-center gap-1.5 bg-ink px-3 py-1.5 text-xs font-bold tracking-widest text-paper uppercase transition-colors duration-200 hover:bg-mustard hover:text-ink"
              style={{ '--hero-tilt': tilt } as CSSProperties}
            >
              <Icon size={13} /> {label}
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
