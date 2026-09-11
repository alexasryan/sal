import { useEffect, useRef, useState } from "react";
import { site } from "../../config";
import { Arrow } from "../ui/Button";
const links = [
  ["about", "Философия"],
  ["practices", "Практики"],
  ["approach", "Подход"],
  ["team", "Команда"],
  ["contacts", "Контакты"],
];
export const Logo = () => (
  <span className="brand">
    <span className="brand-name">{site.brand}</span>
    <span className="brand-descriptor">
      LEGAL
      <br />
      ADVISORY
    </span>
  </span>
);
export default function Header() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const d = dialog.current;
    d?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      d?.close();
      document.body.style.overflow = old;
      toggle.current?.focus({ preventScroll: true });
    };
  }, [open]);
  function navigate(id: string) {
    setOpen(false);
    requestAnimationFrame(() => {
      const section = document.getElementById(id);
      section?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      section?.focus({ preventScroll: true });
      history.replaceState(null, "", `#${id}`);
    });
  }
  return (
    <>
      <header className="header">
        <a href="#top" aria-label="SĀL Legal — на главную">
          <Logo />
        </a>
        <nav className="desktop-nav" aria-label="Основная навигация">
          {links.map(([id, name]) => (
            <a key={id} href={`#${id}`}>
              {name}
            </a>
          ))}
        </nav>
        <a className="header-cta" href="#consultation">
          Обсудить задачу <Arrow diagonal />
        </a>
        <button
          ref={toggle}
          className="menu-toggle"
          onClick={() => setOpen(true)}
          aria-label="Открыть меню"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          <span />
          <span />
        </button>
      </header>
      <dialog
        id="mobile-navigation"
        className="mobile-navigation"
        ref={dialog}
        onCancel={() => setOpen(false)}
      >
        <div className="mobile-nav-head">
          <Logo />
          <button
            type="button"
            className="icon-button"
            aria-label="Закрыть меню"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
        <nav aria-label="Мобильная навигация">
          {links.map(([id, name], i) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(id);
              }}
            >
              <small>0{i + 1}</small>
              {name}
              <Arrow diagonal />
            </a>
          ))}
        </nav>
        <a
          href="#consultation"
          className="button button-primary"
          onClick={(e) => {
            e.preventDefault();
            navigate("consultation");
          }}
        >
          Обсудить задачу <Arrow />
        </a>
        <p className="eyebrow">Ясность в решениях. Уверенность в будущем.</p>
      </dialog>
    </>
  );
}
