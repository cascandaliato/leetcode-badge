import { MutableRefObject, useEffect, useRef } from "react";

const useKeepVisible = <T extends HTMLElement>(
  elementRef: MutableRefObject<T | null>,
  height: number,
  bottomOffset: number
): void => {
  const initialOffsetTop = useRef<number>(0);
  const adjustElementTop = useRef<() => void>(() => {});
  const resetScrollListener = useRef<() => void>(() => {});

  useEffect(() => {
    if (elementRef.current !== null) {
      const element = elementRef.current;

      resetScrollListener.current = () => {
        window.removeEventListener("scroll", adjustElementTop.current);
        element.style.top = "0px";
        initialOffsetTop.current = element.offsetTop;
        adjustElementTop.current = () => {
          const visibleTop = window.scrollY + window.innerHeight;
          element.style.top =
            Math.min(
              0,
              Math.round(
                visibleTop - initialOffsetTop.current - height - bottomOffset
              )
            ) + "px";
        };
        adjustElementTop.current();
        window.addEventListener("scroll", adjustElementTop.current);
      };

      resetScrollListener.current();
      window.addEventListener("resize", resetScrollListener.current);

      return () => {
        window.removeEventListener("scroll", adjustElementTop.current);
        window.removeEventListener("resize", resetScrollListener.current);
      };
    }
  }, [elementRef.current]);
};

export default useKeepVisible;
