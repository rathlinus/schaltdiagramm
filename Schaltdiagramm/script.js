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
    <div class="container">
      <div class="box-container">
        <div class="buttons">
          <button onclick="addBox('left', '${newWrapper.id}')" class="addbutton">Add Box</button>
        </div>
        <h2>Inputs</h2>
        <div class="device" id="left-container-${newWrapper.id}">
          
        </div>
      </div>
      <div class="box-container">
        <textarea type="text" class="devicename"></textarea>
      </div>
      <div class="box-container">
        <div class="buttons">
          <button onclick="addBox('right', '${newWrapper.id}')" class="addbutton">Add Box</button>
        </div>
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
    <div class="container">
      <div class="box-container">
        <div class="buttons">
          <button onclick="addBox('left', '${newWrapper.id}')" class="addbutton">Add Box</button>
        </div>
        <h2>Inputs</h2>
        <div class="device" id="left-container-${newWrapper.id}">
          
        </div>
      </div>
      <div class="box-container">
        <textarea type="text" class="devicename"></textarea>
      </div>
      <div class="box-container">
        <div class="buttons">
          <button onclick="addBox('right', '${newWrapper.id}')" class="addbutton">Add Box</button>
        </div>
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
    <div class="container container-lautsprecher">
      <div class="box-container">
        <div class="buttons">
          <button onclick="addBox('left', '${newWrapper.id}')" class="addbutton">Add Box</button>
        </div>
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
    let newLeft = Math.round((initialX + dx) / 50) * 50;
    let newTop = Math.round((initialY + dy) / 50) * 50;

    wrapper.style.left = `${newLeft}px`;
    wrapper.style.top = `${newTop}px`;

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
      connections.push({
        from: currentDraggingAnchor.id,
        to: target.id,
      });
      console.log("Connection added:", connections);
      updateLine(
        currentLine,
        startX,
        startY,
        target.getBoundingClientRect().left,
        target.getBoundingClientRect().top
      );
      currentLine.setAttribute("data-from", currentDraggingAnchor.id);
      currentLine.setAttribute("data-to", target.id);
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

function updateConnections() {
  connections.forEach((connection) => {
    const fromAnchor = document.getElementById(connection.from);
    const toAnchor = document.getElementById(connection.to);
    if (fromAnchor && toAnchor) {
      const fromRect = fromAnchor.getBoundingClientRect();
      const toRect = toAnchor.getBoundingClientRect();
      const polyline = document.querySelector(
        `polyline[data-from="${connection.from}"][data-to="${connection.to}"]`
      );
      if (polyline) {
        updateLine(
          polyline,
          fromRect.left + fromRect.width / 2,
          fromRect.top + fromRect.height / 2,
          toRect.left + toRect.width / 2,
          toRect.top + toRect.height / 2
        );
      }
    }
  });
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
  });
  box.appendChild(closeButton);

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
  const midX = (x1 + x2) / 2;
  const points = `${x1},${y1} ${midX},${y1} ${midX},${y2} ${x2},${y2}`;
  polyline.setAttribute("points", points);
}

function createGrid() {
  const gridContainer = document.createElement("div");
  gridContainer.className = "grid-container";
  document.body.appendChild(gridContainer);

  const width = window.innerWidth;
  const height = window.innerHeight;

  for (let x = 0; x < width; x += 50) {
    for (let y = 0; y < height; y += 50) {
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
