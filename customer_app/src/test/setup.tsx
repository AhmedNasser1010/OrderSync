import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// ---------------------------------------------------------------------------
// next-intl — return the key itself so assertions can reference message keys.
// ---------------------------------------------------------------------------
const translate = (key: string, values?: Record<string, unknown>) => {
  if (values && typeof values === "object") {
    return `${key} ${Object.values(values).join(" ")}`.trim();
  }
  return key;
};

vi.mock("next-intl", () => ({
  useTranslations: () => translate,
  useLocale: () => "en",
  useMessages: () => ({}),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  getRequestConfig: () => ({}),
  IntlError: class IntlError extends Error {},
  IntlErrorCode: { MISSING_MESSAGE: "MISSING_MESSAGE" },
}));

// ---------------------------------------------------------------------------
// @/i18n/routing — replace next-intl navigation helpers with lightweight stubs.
// ---------------------------------------------------------------------------
vi.mock("@/i18n/routing", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: { pathname?: string } | string;
    children: React.ReactNode;
  }) => {
    const resolved =
      typeof href === "string"
        ? href
        : href?.pathname ?? href?.toString() ?? "/";
    return (
      <a href={resolved} {...props}>
        {children}
      </a>
    );
  },
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  redirect: vi.fn(),
  getPathname: vi.fn(),
}));

// ---------------------------------------------------------------------------
// next/image — render a plain <img>.
// ---------------------------------------------------------------------------
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
    ...props
  }: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === "string" ? src : ""}
      alt={alt ?? ""}
      width={width}
      height={height}
      {...props}
    />
  ),
}));

// ---------------------------------------------------------------------------
// sonner — silent toast.
// ---------------------------------------------------------------------------
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    message: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Browser API polyfills that jsdom does not provide.
// ---------------------------------------------------------------------------
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!("ResizeObserver" in globalThis)) {
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
}

window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.scrollTo = vi.fn();

if (typeof HTMLMediaElement !== "undefined") {
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  HTMLMediaElement.prototype.pause = vi.fn();
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.clearAllMocks();
});
