import { useState, useRef } from "react";

/*
  hook to keep track of the page the user is on when scrolling
  and allows for scrolling to a specific page
*/
export default function useScroll() {
  const [topPage, setTopPage] = useState(0);
  const [nextTopPage, setNextTopPage] = useState(0);
  const [bottomPage, setBottomPage] = useState(0);
  const [nextBottomPage, setNextBottomPage] = useState(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const isScrolling = useRef<boolean>(false);

  // determine if the equipment item is hovering over a scroll area
  // and change the page accordingly
  const handleScroll = (isTop: boolean, position: string) => {
    const changePage = isTop ? setNextTopPage : setNextBottomPage;
    const currPage = isTop ? topPage : bottomPage;
    const change = position === "left" ? -1 : 1;
    if (scrollTimeout.current || isScrolling.current) {
      return;
    }
    changePage(currPage + 0.1 * change);
    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = true;
      changePage(currPage + change);
      scrollTimeout.current = null;
      // timeout ensures the asynchronous scroll doesn't
      // overlap with more calls to handleScroll
      setTimeout(() => {
        isScrolling.current = false;
      }, 500);
    }, 800);
  };

  const clearScroll = () => {
    if (scrollTimeout.current) {
      // set about to scroll indicator back to normal
      setNextTopPage(Math.round(topPage));
      setNextBottomPage(Math.round(bottomPage));
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = null;
    }
  };

  return {
    topPage,
    setTopPage,
    nextTopPage,
    bottomPage,
    setBottomPage,
    nextBottomPage,
    clearScroll,
    handleScroll,
  };
}
