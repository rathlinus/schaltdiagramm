let wrapperCount = 0;
let selectedtype = "";

function changeWrapperType() {
  selectedtype = document.getElementById("wrapper-type").value;
}

function addWrapper() {
  if (selectedtype == "") {
    changeWrapperType();
  }
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
  console.log(selectedtype);
  wrapperContainer.appendChild(newWrapper);
  addDragAndDrop(newWrapper);
}

function addDragAndDrop(wrapper) {
  let isDragging = false;
  let startX, startY, initialX, initialY;

  wrapper.addEventListener("mousedown", function (e) {
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
    const newLeft = Math.round((initialX + dx) / 50) * 50;
    const newTop = Math.round((initialY + dy) / 50) * 50;
    wrapper.style.left = `${newLeft}px`;
    wrapper.style.top = `${newTop}px`;
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const initialWrapper = document.querySelector(".wrapper");
  addDragAndDrop(initialWrapper);
});

function addBox(side, wrapperId) {
  const container = document.getElementById(`${side}-container-${wrapperId}`);
  const box = document.createElement("div");
  box.className = "box";

  const anchor = document.createElement("div");
  anchor.className = "anchor-point-" + side + " anchor-point";

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
}
