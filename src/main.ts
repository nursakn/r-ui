import { ComponentImpl } from "./component";
import { signal, watch } from "./reactive";

const rootElement = document.querySelector("#app");

const root = new ComponentImpl({
  tag: "div",
  setup: (ctx) => {
    const state = signal({ count: 1 });

    function addCounter() {
      state.count++;
    }

    function decreaseCounter() {
      state.count--;
    }

    const isToggle = signal({ value: true })

    function toggle() {
      isToggle.value = !isToggle.value;
    }

    watch(state, (v) => console.log("state updated", v));

    return {
      state,
      addCounter,
      decreaseCounter,
      toggle,
      isToggle,
    }
  },
  events: (setup) => [],
  children: ({
    state,
    isToggle,
    addCounter,
    decreaseCounter,
    toggle,
  }) => [
    new ComponentImpl({
      tag: "button",
      setup: (ctx) => ({}),
      events: (setup) => [{ name: "click", cb: addCounter }],
      children: (setup) => "add",
      deps: [],
    }),
    new ComponentImpl({
      tag: "button",
      setup: (ctx) => ({}),
      events: (setup) => [{ name: "click", cb: decreaseCounter }],
      children: (setup) => "dec",
      deps: [],
    }),
    new ComponentImpl({
      tag: "span",
      setup: (ctx) => ({}),
      events: (setup) => [],
      children: (setup) => {
        console.log(state);
        return `${state.count}`
      },
      deps: [state],
    }),
    new ComponentImpl({
      tag: "button",
      setup: (ctx) => ({}),
      events: (setup) => [{ name: "click", cb: toggle }],
      children: (setup) => "toggle",
      deps: [],
    }),
    new ComponentImpl({
      tag: "span",
      setup: (ctx) => ({}),
      events: (setup) => [],
      children: (setup) => "HI FROM TOGGLE",
      deps: [],
      $if: isToggle,
    }),
  ],
  deps: [],
})

function renderTree(component: ComponentImpl) {
  return component.mount();
}

const renderedTree = renderTree(root);

rootElement?.replaceChildren(renderedTree);
