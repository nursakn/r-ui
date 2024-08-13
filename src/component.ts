import {
  depend,
  SimpleObject,
  SystemEvent,
} from "./reactive";

type TreeNode = ComponentImpl[] | string;

export class ComponentImpl<S extends SimpleObject = any> {
  setup: S;
  el: HTMLElement;
  tag: string;
  customEvents: string[] = [];
  eventListeners: SystemEvent[];
  children: (setup: S) => TreeNode;
  $if?: SimpleObject;
  shadowElement: HTMLElement;

  constructor({
    tag,
    events = () => [],
    setup,
    children,
    deps,
    $if,
  }: {
    tag: string;
    events: (setup: S) => SystemEvent[];
    setup: (ctx: ComponentImpl<S>) => S;
    children: (setup: S) => TreeNode;
    deps: SimpleObject[];
    $if?: SimpleObject;
  }) {
    this.tag = tag;
    this.$if = $if;
    this.children = children;

    this.el = document.createElement(tag);
    this.shadowElement = document.createElement("div");

    this.setup = setup(this);
    this.eventListeners = events(this.setup);

    events(this.setup).forEach(event => {
      this.el.addEventListener(event.name, event.cb);
    })

    deps.forEach(dep => depend(dep, () => this.update()));
    if (this.$if) {
      depend(this.$if, (v) => {
        this.update()
      });
    }

    this.shadowElement.style.display = "none";
  }

  mount() {
    return this.render();
  }

  update() {
    return this.render();
  }

  render() {
    if (this.$if) {
      if (!this.$if.value) {
        console.log("ELEMENTS", this.el.parentNode, this.el)
        this.el.parentNode?.replaceChild(this.shadowElement, this.el);
      } else {
        console.log("!ELEMENTS", this.el.parentNode, this.el)
        this.shadowElement.parentNode?.replaceChild(this.el, this.shadowElement);
      }
    }

    this.el.innerHTML = "";

    const children = this.children(this.setup);

    if (typeof children === "string") {
      this.el.append(children);
    } else {
      children.forEach((child) => this.el.append(child.render()))
    }

    return this.el;
  }
}
