import { describe, it, expect, vi, afterEach } from "vitest";
import getUserSource from "./getUserSource";

const originalUserAgent = navigator.userAgent;
const originalMatchMedia = window.matchMedia;

function setUserAgent(ua: string) {
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    value: ua,
  });
}

function setPwa(isStandalone: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: isStandalone,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    value: originalUserAgent,
  });
  window.matchMedia = originalMatchMedia;
});

describe("getUserSource", () => {
  it("detects a desktop Chrome browser", () => {
    setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    );
    setPwa(false);
    expect(getUserSource()).toBe("pc_chrome");
  });

  it("detects a mobile Chrome browser", () => {
    setUserAgent(
      "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36"
    );
    setPwa(false);
    expect(getUserSource()).toBe("mobile_chrome");
  });

  it("detects a standalone PWA", () => {
    setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    );
    setPwa(true);
    expect(getUserSource()).toBe("pwa_chrome");
  });

  it("detects Firefox", () => {
    setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0"
    );
    setPwa(false);
    expect(getUserSource()).toBe("pc_firefox");
  });

  it("detects Safari (non-Chrome UA)", () => {
    setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
    );
    setPwa(false);
    expect(getUserSource()).toBe("pc_safari");
  });

  it("detects Edge", () => {
    setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
    );
    setPwa(false);
    expect(getUserSource()).toBe("pc_edge");
  });

  it("detects IE", () => {
    setUserAgent(
      "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko"
    );
    setPwa(false);
    expect(getUserSource()).toBe("pc_ie");
  });
});
