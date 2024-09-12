let wrapperCount = 0;
let selectedtype = "";
let connections = [];
let currentDraggingAnchor = null;
let currentLine = null;

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function changeWrapperType() {
  selectedtype = document.getElementById("wrapper-type").value;
}

function addWrapper() {
  if (selectedtype == "") {
    changeWrapperType();
  }

  console.log(selectedtype);
  const wrapperContainer = document.querySelector(".wrapper-container");
  const newWrapper = document.createElement("div");
  newWrapper.className = "wrapper";
  newWrapper.id = `wrapper-${wrapperCount++}`;

  if (selectedtype == "Mixer") {
    newWrapper.innerHTML = `
    <div class="container" id="container-${newWrapper.id}">
            <button onclick="deletewrapper('${newWrapper.id}')" class="removebutton">X</button>

      <div class="box-container">

        <h2>Inputs</h2>
        <div class="device" id="left-container-${newWrapper.id}">
        </div>
      </div>
      <div class="box-container">
        <textarea type="text" class="devicename"></textarea>
      </div>
      <div class="box-container">

        <h2>Outputs</h2>
        <div class="device" id="right-container-${newWrapper.id}">
        </div>
      </div>
    </div>
    <div class="grid-container"></div>
  `;
  }

  if (selectedtype == "Splitter") {
    newWrapper.innerHTML = `
    <div class="container" id="container-${newWrapper.id}">
      <div class="box-container">

        <h2>Inputs</h2>
        <div class="device" id="left-container-${newWrapper.id}">
          
        </div>
      </div>
      <div class="box-container">
        <textarea type="text" class="devicename"></textarea>
      </div>
      <div class="box-container">

        <h2>Outputs</h2>
        <div class="device" id="right-container-${newWrapper.id}">
          
        </div>
      </div>
    </div>
    <div class="grid-container"></div>
  `;
  }

  if (selectedtype == "Lautsprecher") {
    newWrapper.innerHTML = `
    <div class="container container-lautsprecher" id="container-${newWrapper.id}">
      <div class="box-container">

        <h2>Lautsprecher</h2>
        <div class="device" id="left-container-${newWrapper.id}">
          
        </div>
      </div>
      <div class="box-container">
        <textarea type="text" class="devicename"></textarea>
      </div>
    </div>
    <div class="grid-container"></div>
  `;
  }
  wrapperContainer.appendChild(newWrapper);
  //add one box to the left and right side
  addBox("left", newWrapper.id);
  addBox("right", newWrapper.id);
  addDragAndDrop(newWrapper);
}

function addDragAndDrop(wrapper) {
  let isDragging = false;
  let startX, startY, initialX, initialY;

  wrapper.addEventListener("mousedown", function (e) {
    if (e.target.classList.contains("anchor-point")) {
      currentDraggingAnchor = e.target;
      startX = e.clientX;
      startY = e.clientY;
      currentLine = createLine(startX, startY, startX, startY);
      document.addEventListener("mousemove", onAnchorMouseMove);
      document.addEventListener("mouseup", onAnchorMouseUp);
      return;
    }
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialX = wrapper.offsetLeft;
    initialY = wrapper.offsetTop;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let newLeft = Math.round((initialX + dx) / 25) * 25;
    let newTop = Math.round((initialY + dy) / 25) * 25;

    wrapper.style.left = `${newLeft}px`;
    wrapper.style.top = `${newTop}px`;

    // Recalculate and redraw all lines connected to this wrapper
    updateConnections();
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  function onAnchorMouseMove(e) {
    updateLine(currentLine, startX, startY, e.clientX, e.clientY);
  }

  function onAnchorMouseUp(e) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (
      target &&
      target.classList.contains("anchor-point") &&
      target !== currentDraggingAnchor
    ) {
      const fromRect = currentDraggingAnchor.getBoundingClientRect();
      const toRect = target.getBoundingClientRect();

      const midX = (fromRect.left + toRect.left) / 2;
      const offsetX = 50; // Introduce an initial offset to ensure spacing

      // Add connection to the array with initial positions, midpoint, and offset
      connections.push({
        from: currentDraggingAnchor.id,
        to: target.id,
        fromX: fromRect.left,
        fromY: fromRect.top,
        toX: toRect.left,
        toY: toRect.top,
        midX: midX,
        offsetX: offsetX, // Store the offset
      });

      // Draw the line using the stored offset
      updateLineFromStoredData({
        from: currentDraggingAnchor.id,
        to: target.id,
        fromX: fromRect.left,
        fromY: fromRect.top,
        toX: toRect.left,
        toY: toRect.top,
        midX: midX,
        offsetX: offsetX,
      });

      currentLine.setAttribute("data-from", currentDraggingAnchor.id);
      currentLine.setAttribute("data-to", target.id);

      // Adjust duplicate midpoints if necessary
      adjustDuplicateMidpoints();
    } else {
      document.getElementById("connection-lines").removeChild(currentLine);
    }
    currentDraggingAnchor = null;
    currentLine = null;
    document.removeEventListener("mousemove", onAnchorMouseMove);
    document.removeEventListener("mouseup", onAnchorMouseUp);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const initialWrapper = document.querySelector(".wrapper");
  if (initialWrapper) {
    addDragAndDrop(initialWrapper);
  }
});

function adjustDuplicateMidpoints() {
  const midXValues = {};

  // Step 1: Collect all midX values and their associated connections
  connections.forEach((connection) => {
    const roundedMidX = Math.round(connection.midX); // Round to avoid float precision issues

    if (midXValues[roundedMidX]) {
      midXValues[roundedMidX].push(connection);
    } else {
      midXValues[roundedMidX] = [connection];
    }
  });

  // Step 2: Adjust midpoints if there are multiple connections with the same midX
  Object.keys(midXValues).forEach((midX) => {
    const connectionsWithSameMidX = midXValues[midX];
    if (connectionsWithSameMidX.length > 1) {
      const stepSize = 20; // Step size for shifting

      // Step 3: Apply even shifts left and right to avoid intersections
      const totalConnections = connectionsWithSameMidX.length;
      const midIndex = Math.floor(totalConnections / 2);

      // Step 4: Determine if we need to invert the shifts based on Y coordinates
      const invertShift =
        connectionsWithSameMidX[0].fromY > connectionsWithSameMidX[0].toY;

      connectionsWithSameMidX.forEach((connection, index) => {
        let shiftDirection;

        // Invert the shift if the connection is drawn below the midpoint
        if (invertShift) {
          // Shift right for connections before the midpoint, left for after (inverted)
          shiftDirection = index < midIndex ? 1 : -1;
        } else {
          // Regular order: Shift left for connections before the midpoint, right for after
          shiftDirection = index < midIndex ? -1 : 1;
        }

        if (index !== midIndex) {
          const shiftAmount = Math.abs(midIndex - index) * stepSize;
          connection.midX = parseInt(midX) + shiftDirection * shiftAmount;
        } else {
          connection.midX = parseInt(midX); // Middle connection stays on the original midX
        }

        updateLineFromStoredData(connection); // Update the line with the new midX
      });
    }
  });
}

function checkAndSeparateLines() {
  connections.forEach((connection, index) => {
    const fromAnchor = document.getElementById(connection.from);
    const toAnchor = document.getElementById(connection.to);
    if (fromAnchor && toAnchor) {
      const fromRect = fromAnchor.getBoundingClientRect();
      const toRect = toAnchor.getBoundingClientRect();

      let midX = (fromRect.left + toRect.left) / 2;
      connection.midX = midX; // Update stored midpoint

      const currentBox = {
        left: Math.min(fromRect.left, toRect.left),
        right: Math.max(fromRect.left, toRect.left),
        top: Math.min(fromRect.top, toRect.top),
        bottom: Math.max(fromRect.top, toRect.top),
      };

      // Check against all other connections for overlaps
      connections.forEach((otherConnection, otherIndex) => {
        if (index !== otherIndex) {
          const otherFromAnchor = document.getElementById(otherConnection.from);
          const otherToAnchor = document.getElementById(otherConnection.to);
          if (otherFromAnchor && otherToAnchor) {
            const otherFromRect = otherFromAnchor.getBoundingClientRect();
            const otherToRect = otherToAnchor.getBoundingClientRect();

            const otherBox = {
              left: Math.min(otherFromRect.left, otherToRect.left),
              right: Math.max(otherFromRect.left, otherToRect.left),
              top: Math.min(otherFromRect.top, otherToRect.top),
              bottom: Math.max(otherFromRect.top, otherToRect.top),
            };

            // Check if current box overlaps with the other box
            if (isOverlapping(currentBox, otherBox)) {
              // Adjust midpoint to separate lines
              connection.midX += 20; // Shift midpoint
              updateLineFromStoredData(connection); // Recalculate the line
            }
          }
        }
      });
    }
  });
}

function isOverlapping(box1, box2) {
  return !(
    box1.right < box2.left ||
    box1.left > box2.right ||
    box1.bottom < box2.top ||
    box1.top > box2.bottom
  );
}

function updateLineFromStoredData(connection) {
  const fromAnchor = document.getElementById(connection.from);
  const toAnchor = document.getElementById(connection.to);
  if (fromAnchor && toAnchor) {
    const fromRect = fromAnchor.getBoundingClientRect();
    const toRect = toAnchor.getBoundingClientRect();

    const polyline = document.querySelector(
      `polyline[data-from="${connection.from}"][data-to="${connection.to}"]`
    );

    if (polyline) {
      // Apply the adjusted midX to redraw the line
      let midX = connection.midX;

      // Shift the y-coordinates down by 10px
      const adjustedFromY = fromRect.top + 10;
      const adjustedToY = toRect.top + 10;

      // Redraw the line with the updated points
      const points = `${fromRect.left},${adjustedFromY} ${midX},${adjustedFromY} ${midX},${adjustedToY} ${toRect.left},${adjustedToY}`;
      polyline.setAttribute("points", points);
    }
  }
}

function updateConnections() {
  connections.forEach((connection) => {
    const fromAnchor = document.getElementById(connection.from);
    const toAnchor = document.getElementById(connection.to);
    if (fromAnchor && toAnchor) {
      const fromRect = fromAnchor.getBoundingClientRect();
      const toRect = toAnchor.getBoundingClientRect();

      // Update positions in the connections array
      connection.fromX = fromRect.left;
      connection.fromY = fromRect.top;
      connection.toX = toRect.left;
      connection.toY = toRect.top;

      // Recalculate the midpoint before adjusting for overlaps
      connection.midX = (connection.fromX + connection.toX) / 2;

      // Redraw the line with the updated midpoint
      updateLineFromStoredData(connection);
    }
  });

  // Adjust duplicate midpoints to avoid overlap
  adjustDuplicateMidpoints();
}

function preventLineOverlaps() {
  connections.forEach((connection, index) => {
    connections.forEach((otherConnection, otherIndex) => {
      if (index !== otherIndex) {
        const from1 = document
          .getElementById(connection.from)
          .getBoundingClientRect();
        const to1 = document
          .getElementById(connection.to)
          .getBoundingClientRect();
        const from2 = document
          .getElementById(otherConnection.from)
          .getBoundingClientRect();
        const to2 = document
          .getElementById(otherConnection.to)
          .getBoundingClientRect();

        // Check if lines are too close
        if (areLinesTooClose(from1, to1, from2, to2)) {
          // Adjust the midX to separate them
          connection.midX += 20;
          updateLineFromStoredData(connection);
        }
      }
    });
  });
}

// Helper function to determine if two lines are too close
function areLinesTooClose(from1, to1, from2, to2) {
  const dist1 = Math.hypot(from1.left - from2.left, from1.top - from2.top);
  const dist2 = Math.hypot(to1.left - to2.left, to1.top - to2.top);
  return dist1 < 20 || dist2 < 20;
}

function updateLineWithProximityCheck(polyline, x1, y1, x2, y2) {
  if (!polyline) return;

  // Calculate the midpoint for the line and use stored midX if available
  let midX = (x1 + x2) / 2;

  // Calculate the bounding box of the current line
  let currentBox = {
    left: Math.min(x1, x2),
    right: Math.max(x1, x2),
    top: Math.min(y1, y2),
    bottom: Math.max(y1, y2),
  };

  // Check all other lines for proximity
  connections.forEach((connection) => {
    const otherLine = document.querySelector(
      `polyline[data-from="${connection.from}"][data-to="${connection.to}"]`
    );

    if (otherLine && otherLine !== polyline) {
      const points = otherLine.getAttribute("points").split(" ");
      const [ox1, oy1] = points[0].split(",").map(Number);
      const [ox2, oy2] = points[points.length - 1].split(",").map(Number);

      // Calculate the bounding box of the other line
      let otherBox = {
        left: Math.min(ox1, ox2),
        right: Math.max(ox1, ox2),
        top: Math.min(oy1, oy2),
        bottom: Math.max(oy1, oy2),
      };

      // If the bounding boxes are too close, shift the midX
      if (
        Math.abs(currentBox.left - otherBox.left) < 20 ||
        Math.abs(currentBox.top - otherBox.top) < 20
      ) {
        midX += 20; // Shift the midpoint by 20px to avoid overlap
      }
    }
  });

  // Recalculate the points for the polyline after adjusting the midpoint
  const points = `${x1},${y1} ${midX},${y1} ${midX},${y2} ${x2},${y2}`;
  polyline.setAttribute("points", points);
}

function addBox(side, wrapperId) {
  const container = document.getElementById(`${side}-container-${wrapperId}`);
  const box = document.createElement("div");
  box.className = "box";

  const anchor = document.createElement("div");
  anchor.className = "anchor-point-" + side + " anchor-point";
  anchor.id = uuidv4();

  anchor.addEventListener("click", () => {
    changeColor(anchor);
  });
  box.appendChild(anchor);

  const textField = document.createElement("input");
  textField.type = "text";
  textField.className = "connector";
  box.appendChild(textField);

  const closeButton = document.createElement("button");
  closeButton.textContent = "x";
  closeButton.className = "close-button";
  closeButton.addEventListener("click", () => {
    container.removeChild(box);
    // also remove the connection from the connections array and the svg

    connections = connections.filter(
      (connection) =>
        connection.from !== anchor.id && connection.to !== anchor.id
    );
    const polyline = document.querySelector(
      `polyline[data-from="${anchor.id}"], polyline[data-to="${anchor.id}"]`
    );
    if (polyline) {
      polyline.parentNode.removeChild(polyline);
    }

    //update position of all connections
    updateConnections();
  });
  box.appendChild(closeButton);

  // Create and append the plus icon
  const plusIcon = document.createElement("div");
  plusIcon.className = "plus-icon";
  plusIcon.textContent = "+";
  plusIcon.addEventListener("click", () => {
    addBox(side, wrapperId);
  });
  box.appendChild(plusIcon);

  container.appendChild(box);
}

function createLine(x1, y1, x2, y2) {
  const svg = document.getElementById("connection-lines");
  if (!svg) {
    console.error("SVG element not found");
    return null;
  }
  const polyline = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polyline"
  );
  polyline.setAttribute("points", `${x1},${y1} ${x1},${y1} ${x2},${y2}`);
  polyline.setAttribute("stroke", "black");
  polyline.setAttribute("stroke-width", "2");
  polyline.setAttribute("fill", "none");

  svg.appendChild(polyline);
  return polyline;
}

function updateLine(polyline, x1, y1, x2, y2) {
  if (!polyline) return;

  // Calculate the midpoint for horizontal to vertical transition
  let midX = (x1 + x2) / 2;

  // Calculate the bounding box of the current line
  let currentBox = {
    left: Math.min(x1, x2),
    right: Math.max(x1, x2),
    top: Math.min(y1, y2),
    bottom: Math.max(y1, y2),
  };

  // Check all other existing lines to avoid overlap
  connections.forEach((connection) => {
    const otherLine = document.querySelector(
      `polyline[data-from="${connection.from}"][data-to="${connection.to}"]`
    );

    if (otherLine && otherLine !== polyline) {
      const points = otherLine.getAttribute("points").split(" ");
      const [ox1, oy1] = points[0].split(",").map(Number);
      const [ox2, oy2] = points[points.length - 1].split(",").map(Number);

      // Calculate bounding box for the other line
      let otherBox = {
        left: Math.min(ox1, ox2),
        right: Math.max(ox1, ox2),
        top: Math.min(oy1, oy2),
        bottom: Math.max(oy1, oy2),
      };

      // Check if the boxes are too close, maintain at least 20px distance
      if (
        Math.abs(currentBox.left - otherBox.left) < 20 ||
        Math.abs(currentBox.top - otherBox.top) < 20
      ) {
        // Adjust midX by shifting it 20px to avoid overlap
        midX += 20;
      }
    }
  });

  // Recalculate points after adjusting midX
  const points = `${x1},${y1} ${midX},${y1} ${midX},${y2} ${x2},${y2}`;
  polyline.setAttribute("points", points);
}

function createGrid() {
  const gridContainer = document.createElement("div");
  gridContainer.className = "grid-container";
  document.body.appendChild(gridContainer);

  const width = window.innerWidth;
  const height = window.innerHeight;

  for (let x = 0; x < width; x += 25) {
    for (let y = 0; y < height; y += 25) {
      const dot = document.createElement("div");
      dot.className = "grid-dot";
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      gridContainer.appendChild(dot);
    }
  }
}

createGrid();

function changeColor(element) {
  const colors = ["red", "green", "blue", "yellow"];
  let currentColor = element.style.backgroundColor;
  let nextColor = colors[(colors.indexOf(currentColor) + 1) % colors.length];
  element.style.backgroundColor = nextColor;

  const connection = connections.find(
    (conn) => conn.from === element.id || conn.to === element.id
  );

  if (connection) {
    const otherAnchorId =
      connection.from === element.id ? connection.to : connection.from;
    const otherAnchor = document.getElementById(otherAnchorId);
    if (otherAnchor) {
      otherAnchor.style.backgroundColor = nextColor;
    }

    const polyline = document.querySelector(
      `polyline[data-from="${connection.from}"][data-to="${connection.to}"]`
    );
    if (polyline) {
      polyline.setAttribute("stroke", nextColor);
    }
  }
}

function deletewrapper(wrapperId) {
  console.log("test");

  //get all the anchors of the wrapper
  let anchors = document.querySelectorAll(`#${wrapperId} .anchor-point`);
  //remove all the connections from the connections array and the svg
  anchors.forEach((anchor) => {
    connections = connections.filter(
      (connection) =>
        connection.from !== anchor.id && connection.to !== anchor.id
    );
    const polyline = document.querySelector(
      `polyline[data-from="${anchor.id}"], polyline[data-to="${anchor.id}"]`
    );
    if (polyline) {
      polyline.parentNode.removeChild(polyline);
    }
  });

  let wrapper2 = document.getElementById(`container-${wrapperId}`);
  wrapper2.parentNode.remove();
}
function start() {
  addWrapper();
  editmode(true);
}

start();

function editmode(status) {
  //move editindicator to the right position if false
  let editindicator = document.getElementById("editindicator");
  let viewmode = document.getElementById("viewmode");
  let editmode = document.getElementById("editmode");
  if (status == false) {
    editindicator.style.left = "50%";
    viewmode.style.color = "#fff";
    editmode.style.color = "#000";
  } else {
    editindicator.style.left = "0px";
    viewmode.style.color = "#000";
    editmode.style.color = "#fff";
  }

  //hide all items with the class
}
