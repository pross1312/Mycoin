export default function({children, hidden = false, onClick, onEscape = onClick}) {
  const ID = "floating-overlay-id";
  const handleKey = (e) => {
    if (e.code === 'Escape' && onEscape) {
      e.preventDefault();
      e.stopPropagation();
      onEscape();
    }
  }
  const handleClick = (e) => {
    if (e.target.id === ID) {
      // console.log(e); 
      e.preventDefault();
      e.stopPropagation();
      if (onClick) onClick();
    }
  };
  return (
    <div id={ID} tabIndex="1" onKeyDown={handleKey} onMouseDown={handleClick}
         className={`${hidden ? "hidden" : ""} fixed flex flex-col justify-center place-items-center w-screen h-screen cursor-default! top-0 left-0 bg-black/25 backdrop-blur-[2px] z-100`}>
      {children}
    </div>
  );
}
