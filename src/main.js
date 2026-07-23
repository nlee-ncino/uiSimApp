import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)

const LoggerPlugin = {
    install(Vue, options = {}) {
        const logLevel = options.logLevel || 'debug';
        const levels = ['debug', 'info', 'warn', 'error'];
        const levelIndex = levels.indexOf(logLevel);

        const logger = {};

        levels.forEach((level, index) => {
            logger[level] = (...args) => {
                if (index >= levelIndex) {
                    console[level](`[${level.toUpperCase()}]`, ...args);
                }
            };
        });

        Vue.prototype.$log = logger;

        Vue.logger = logger;
    }
};

Vue.use(LoggerPlugin, {logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'});


Vue.config.productionTip = false

new Vue({
    render: h => h(App)
}).$mount('#app')