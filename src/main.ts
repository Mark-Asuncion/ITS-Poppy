import { invoke } from "@tauri-apps/api/tauri";
import Konva from "konva";

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

async function greet() {
  if (greetMsgEl && greetInputEl) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    greetMsgEl.textContent = await invoke("greet", {
      name: greetInputEl.value,
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
  // first we need to create a stage
  var stage = new Konva.Stage({
    container: 'root',   // id of container <div>
    width: window.innerWidth,
    height: window.innerHeight,
  });
  stage.on("mousedown", (e) => {
    if ( e.evt.button == 1 ) {
      stage.startDrag();
    }
  });

  // then create layer
  var layer = new Konva.Layer();
  var tr = new Konva.Transformer();

  // create our shape
  var circle = new Konva.Circle({
    x: stage.width() / 2,
    y: stage.height() / 2,
    radius: 70,
    fill: 'red',
    stroke: 'black',
    strokeWidth: 4,
    draggable: true,
  });

  // add the shape to the layer
  tr.nodes([circle]);
  layer.add(tr);
  layer.add(circle);

  // add the layer to the stage
  stage.add(layer);

  // draw the image
  layer.draw();
});
