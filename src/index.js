import vue from 'vue';
import hypernova, { serialize, load } from 'hypernova';

export const Vue = vue;

export const renderVue = (name, Component) => hypernova({
  server() {
    const createRenderer = require('vue-server-renderer').createRenderer;
    
    return async (propsData) => {
      const vm = new Component({
        propsData,
      });

      const renderer = createRenderer();

      const contents = await renderer.renderToString(vm);

      return serialize(name, contents, propsData);
    };
  },

  client() {
    const payloads = load(name);
    if (payloads) {
      payloads.forEach((payload) => {
        const { node, data: propsData } = payload;

        const vm = new Component({
          propsData,
        });

        vm.$mount(node.children[0]);
      });
    }

    return Component;
  },
});


export const renderVuex = (name, ComponentDefinition, createStore) => hypernova({
  server() {
    return async (propsData) => {
      const store = createStore();

      const Component = Vue.extend({
        ...ComponentDefinition,
        store,
      });

      const vm = new Component({
        propsData,
      });

      const renderer = createRenderer();

      const contents = await renderer.renderToString(vm);

      return serialize(name, contents, { propsData, state: vm.$store.state });
    };
  },

  client() {
    const payloads = load(name);
    if (payloads) {
      payloads.forEach((payload) => {
        const { node, data } = payload;
        const { propsData, state } = data;
        const store = createStore();

        const Component = Vue.extend({
          ...ComponentDefinition,
          store,
        });

        const vm = new Component({
          propsData,
        });

        vm.$store.replaceState(state);

        vm.$mount(node.children[0]);
      });
    }

    return ComponentDefinition;
  },
});
