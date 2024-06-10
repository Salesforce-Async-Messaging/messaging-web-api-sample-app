/**
 * Source: https://codesandbox.io/p/sandbox/draggable-component-react-mglg6d?file=%2Fsrc%2FDraggable.js.
 */

import { useRef, useState, useEffect } from "react";

export default function Draggable({ intitialPosition, children }) {
  const ref = useRef();
  const [state, setState] = useState({
    pos: intitialPosition,
    dragging: false,
    rel: {} // position relative to the cursor
  });

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    //console.log(state); // print new coordinates

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [state.dragging, state.attached]);

  // calculate relative position to the mouse and set dragging=true
  const onMouseDown = (e) => {
    // only left mouse button
    if (e.button !== 0) return;
    var pos = ref.current.getBoundingClientRect();
    const rel = {
      x: e.pageX - pos.left,
      y: e.pageY - pos.top
    };

    setState((p) => ({ ...p, dragging: true, rel }));
    e.stopPropagation();
    e.preventDefault();
  };
  const onMouseUp = (e) => {
    setState((p) => ({ ...p, dragging: false }));
    e.stopPropagation();
    e.preventDefault();
  };
  const onMouseMove = (e) => {
    if (!state.dragging) return;
    const pos = {
      x: e.pageX - state.rel.x,
      y: e.pageY - state.rel.y
    };

    setState((p) => ({ ...p, pos }));
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      style={{
        position: "absolute",
        left: state.pos.x,
        top: state.pos.y
      }}
    >
      {children}
    </div>
  );
};