import Yoga from 'yoga-layout';
import toPairsIn from 'lodash.topairsin';
import isFunction from 'lodash.isfunction';
import upperFirst from 'lodash.upperfirst';
import StyleSheet from '../stylesheet';

class Base {
  parent = null;
  children = [];

  static defaultProps = {
    style: {},
  };

  constructor(root, props) {
    this.root = root;

    this.props = {
      ...this.constructor.defaultProps,
      ...Base.defaultProps,
      ...props,
    };

    this.style = StyleSheet.resolve(this.props.style);
    this.layout = Yoga.Node.create();

    if (this.props) {
      this.applyProps(this.props);
    }
  }

  appendChild(child) {
    child.parent = this;
    this.children.push(child);
    this.layout.insertChild(child.layout, this.layout.getChildCount());
  }

  removeChild(child) {
    const index = this.children.indexOf(child);

    child.parent = null;
    this.children.slice(index, 1);
    this.layout.removeChild(child.layout, index);
  }

  applyProps(props) {
    if (this.style) {
      toPairsIn(this.style).map(([attribute, value]) => {
        this.applyStyle(attribute, value);
      });
    }
  }

  applyStyle(attribute, value) {
    const setter = `set${upperFirst(attribute)}`;

    switch (attribute) {
      case 'margin':
        this.layout.setMargin(Yoga.EDGE_ALL, value);
        break;
      case 'marginTop':
        this.layout.setMargin(Yoga.EDGE_TOP, value);
        break;
      case 'marginRight':
        this.layout.setMargin(Yoga.EDGE_RIGHT, value);
        break;
      case 'marginBottom':
        this.layout.setMargin(Yoga.EDGE_BOTTOM, value);
        break;
      case 'marginLeft':
        this.layout.setMargin(Yoga.EDGE_LEFT, value);
        break;
      case 'marginHorizontal':
        this.layout.setMargin(Yoga.EDGE_HORIZONTAL, value);
        break;
      case 'marginVertical':
        this.layout.setMargin(Yoga.EDGE_VERTICAL, value);
        break;
      case 'padding':
        this.layout.setPadding(Yoga.EDGE_ALL, value);
        break;
      case 'paddingTop':
        this.layout.setPadding(Yoga.EDGE_TOP, value);
        break;
      case 'paddingRight':
        this.layout.setPadding(Yoga.EDGE_RIGHT, value);
        break;
      case 'paddingBottom':
        this.layout.setPadding(Yoga.EDGE_BOTTOM, value);
        break;
      case 'paddingLeft':
        this.layout.setPadding(Yoga.EDGE_LEFT, value);
        break;
      case 'paddingHorizontal':
        this.layout.setPadding(Yoga.EDGE_HORIZONTAL, value);
        break;
      case 'paddingVertical':
        this.layout.setPadding(Yoga.EDGE_VERTICAL, value);
        break;
      default:
        if (isFunction(this.layout[setter])) {
          this.layout[setter](value);
        }
    }
  }

  async recalculateLayout() {
    const childs = await Promise.all(
      this.children.map(child => child.recalculateLayout()),
    );
    return childs;
  }

  getAbsoluteLayout() {
    const myLayout = this.layout.getComputedLayout();

    const parentLayout = this.parent.getAbsoluteLayout
      ? this.parent.getAbsoluteLayout()
      : { left: 0, top: 0 };

    return {
      left: myLayout.left + parentLayout.left,
      top: myLayout.top + parentLayout.top,
      height: myLayout.height,
      width: myLayout.width,
    };
  }

  drawBackgroundColor() {
    const { left, top, width, height } = this.getAbsoluteLayout();
    const { backgroundColor } = this.style;

    if (backgroundColor) {
      this.root
        .fillColor(backgroundColor)
        .rect(left, top, width, height)
        .fill();
    }
  }

  async renderChildren() {
    const childRenders = await Promise.all(
      this.children.map(child => child.render()),
    );
    return childRenders;
  }

  async render(value) {
    return [value, await this.renderChildren()].join('');
  }
}

export default Base;
