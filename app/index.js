import each from "lodash/each";
import About from "pages/about";
import Collections from "pages/collections";
import Detail from "pages/detail";
import Home from "pages/home";
import Navigation from "./components/Navigation";
import Preloader from "./components/Preloader";

import Canvas from "components/Canvas";

class App {
  constructor() {
    this.createContent();
    this.createPreloader();
    this.createPages();
    this.createNavigation();
    this.createCanvas();
    this.addEventListeners();
    this.addLinkListerners();
  }

  createPreloader() {
    this.preloader = new Preloader();
    this.preloader.once("completed", this.onPreloaded.bind(this));
  }

  /**
   * Events
   */
  onPreloaded() {
    this.preloader.destroy();
    this.onResize();
    this.page.show();
    this.update();
  }

  onPopState() {
    this.onChange({
      url: window.location.pathname,
      push: false,
    });
  }

  createContent() {
    this.content = document.querySelector(".content");
    this.template = this.content.getAttribute("data-template");
  }

  createNavigation() {
    this.navigation = new Navigation({
      template: this.template,
    });
  }

  createCanvas() {
    this.canvas = new Canvas();
  }

  createPages() {
    this.pages = {
      about: new About(),
      collections: new Collections(),
      detail: new Detail(),
      home: new Home(),
    };
    this.page = this.pages[this.template];
    this.page.create();
  }

  async onChange({ url, push = true }) {
    await this.page.hide();

    const request = await window.fetch(url);

    if (request.status === 200) {
      const html = await request.text();
      const div = document.createElement("div");
      div.innerHTML = html;

      if (push) {
        window.history.pushState({}, "", url);
      }

      const divContent = div.querySelector(".content");

      this.template = divContent.getAttribute("data-template");
      this.navigation.onChange(this.template);
      this.content.setAttribute("data-template", this.template);
      this.content.innerHTML = divContent.innerHTML;

      this.page = this.pages[this.template];

      this.page.create();
      this.onResize();
      this.page.show();

      this.addLinkListerners();
    } else {
      console.log("Error");
    }
  }

  onResize() {
    if (this.canvas && this.canvas.onResize) {
      this.canvas.onResize();
    }
    if (this.page && this.page.onResize) {
      this.page.onResize();
    }
  }

  onTouchDown(event) {
    if (this.canvas && this.canvas.onTouchDown) {
      this.canvas.onTouchDown(event);
    }
  }

  onTouchMove(event) {
    if (this.canvas && this.canvas.onTouchMove) {
      this.canvas.onTouchMove(event);
    }
  }

  onTouchUp(event) {
    if (this.canvas && this.canvas.onTouchUp) {
      this.canvas.onTouchUp(event);
    }
  }

  // onWheel(event) {
  //   const normalizedWheel = NormalizeWheel(event);

  //   if (this.canvas && this.canvas.onWheel) {
  //     this.canvas.onWheel(normalizedWheel);
  //   }

  //   if (this.page && this.page.onWheel) {
  //     this.page.onWheel(normalizedWheel);
  //   }
  // }

  /**
   * Loop.
   */
  update() {
    if (this.canvas && this.canvas.update) {
      this.canvas.update();
    }
    if (this.page && this.page.update) {
      this.page.update();
    }
    this.frame = window.requestAnimationFrame(this.update.bind(this));
  }

  /**
   * Listeners.
   */
  addEventListeners() {
    window.addEventListener("popstate", this.onPopState.bind(this));
    //window.addEventListener('mousewheel', this.onWheel.bind(this));

    window.addEventListener("mousedown", this.onTouchDown.bind(this));
    window.addEventListener("mousemove", this.onTouchMove.bind(this));
    window.addEventListener("mouseup", this.onTouchUp.bind(this));

    window.addEventListener("touchstart", this.onTouchDown.bind(this));
    window.addEventListener("touchmove", this.onTouchMove.bind(this));
    window.addEventListener("touchend", this.onTouchUp.bind(this));

    window.addEventListener("resize", this.onResize.bind(this));
  }

  addLinkListerners() {
    const links = document.querySelectorAll("a");
    each(links, (link) => {
      link.onclick = (event) => {
        event.preventDefault();

        const { href } = link;

        this.onChange({ url: href });
      };
    });
  }
}

new App();
