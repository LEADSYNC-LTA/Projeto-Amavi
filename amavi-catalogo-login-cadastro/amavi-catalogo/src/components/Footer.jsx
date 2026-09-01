import { STORE_CONFIG } from '../config/store'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-taupe-dark bg-taupe">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <span className="font-display text-lg text-ink">{STORE_CONFIG.name}</span>

        <div className="flex items-center gap-5 text-sm">
          <a
            
            href="https://www.instagram.com/amavi_closet?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-ink"
            aria-label="Instagram da Amavi"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
            </svg>
            @{STORE_CONFIG.instagramHandle}
          </a>
          <a
            href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-ink"
            aria-label="WhatsApp da Amavi"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z" strokeLinejoin="round" />
              <path d="M8.5 8.7c.2-.6.7-.6 1-.6h.5c.2 0 .4 0 .6.5.2.5.6 1.6.6 1.7.1.1.1.3 0 .5-.1.2-.2.3-.3.4l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.6-.7c.2-.2.4-.2.6-.1l1.5.7c.2.1.4.2.4.4 0 .6-.2 1.3-.5 1.6-.4.4-1.2.7-2.1.5-1.8-.4-3.7-1.4-5.1-2.9-1.2-1.2-2-2.5-2.4-3.5-.3-.9-.2-1.7.3-2.1Z" />
            </svg>
            Fale com a gente
          </a>
        </div>

        <p className="text-xs text-ink-soft/70">
          © {new Date().getFullYear()} {STORE_CONFIG.name}. Consulte disponibilidade antes de garantir sua peça.
        </p>
      </div>
    </footer>
  )
}
